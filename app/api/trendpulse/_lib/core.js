// Server core for the trend game: Redis-backed credits/points ledger,
// timed dot reveal, leaderboard with VNS names, and on-chain USDT.b purchase
// verification. Runs inside Next route handlers on Vercel; Redis comes from
// the marketplace integration (REDIS_URL).

import crypto from 'crypto';
import Redis from 'ioredis';
import { createPublicClient, http, getAddress, erc20Abi, parseEventLogs } from 'viem';
import contracts from '../../../../config/vtru-contracts.json';
import {
  N,
  LOCK_AT,
  TOLERANCE,
  genSeries,
  olsFit,
  dealGame,
  clientGameView,
  dotCount,
  pointsAfter,
} from '../../../trendpulse/_lib/gamemath';

const NETWORK = process.env.VTRU_NETWORK || 'mainnet';
const RPC_URL = process.env.VTRU_RPC_URL || 'https://rpc.vitruveo.ai';
const TREASURY = process.env.TREASURY_ADDRESS || '';
const BRIDGE_URL = 'https://scope.vitruveo.ai/bridge/usdt';
const GAME_TTL = 3600; // seconds
const VNS_TTL = 86400; // seconds; VNS name cache
const LEADERBOARD_SIZE = 20;
const TEST_CREDITS = 5;
const PRICE_E2 = 99; // credit price in hundredths of USDT.b (0.99/credit)

// On localhost, buys skip the chain and just grant TEST_CREDITS.
const TEST_MODE = process.env.GAME_TEST_MODE === '1' || process.env.NODE_ENV === 'development';

const USDT_ADDRESS = getAddress(contracts[NETWORK].BridgedUSDT);
const VNS_REGISTRAR = getAddress(contracts[NETWORK].VNSRegistrar);
const VNS_ABI = [
  {
    type: 'function',
    name: 'namesOf',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'string[]' }],
  },
];

// Reuse connections across serverless invocations.
function getRedis() {
  if (!globalThis.__ptgameRedis) {
    const url = process.env.REDIS_URL || process.env.KV_URL;
    if (!url) throw new Error('REDIS_URL not configured');
    globalThis.__ptgameRedis = new Redis(url, { maxRetriesPerRequest: 2 });
  }
  return globalThis.__ptgameRedis;
}

const chain = createPublicClient({ transport: http(RPC_URL) });

let decimalsPromise = null;
function getDecimals() {
  decimalsPromise ??= chain
    .readContract({ address: USDT_ADDRESS, abi: erc20Abi, functionName: 'decimals' })
    .then(Number)
    .catch(() => 18); // measured on-chain value for USDT.b
  return decimalsPromise;
}

const key = {
  credits: (a) => `ptgame:credits:${a}`,
  played: (a) => `ptgame:played:${a}`,
  won: (a) => `ptgame:won:${a}`,
  tx: (h) => `ptgame:tx:${h}`,
  game: (id) => `ptgame:game:${id}`,
  lb: 'ptgame:lb',
  vns: (a) => `ptgame:vns:${a}`,
};

function normAddress(a) {
  try {
    return getAddress(a);
  } catch (e) {
    return null;
  }
}

export async function stateOf(address) {
  const r = getRedis();
  const [credits, played, won, points] = await Promise.all([
    r.get(key.credits(address)),
    r.get(key.played(address)),
    r.get(key.won(address)),
    r.zscore(key.lb, address),
  ]);
  return {
    credits: parseInt(credits || '0', 10),
    played: parseInt(played || '0', 10),
    won: parseInt(won || '0', 10),
    points: Math.round(parseFloat(points || '0')),
  };
}

export async function gameConfig() {
  return {
    chainId: NETWORK === 'mainnet' ? 1490 : 14333,
    usdt: USDT_ADDRESS,
    usdtDecimals: await getDecimals(),
    treasury: TREASURY,
    creditPriceUsdt: PRICE_E2 / 100,
    creditPriceE2: PRICE_E2,
    bridgeUrl: BRIDGE_URL,
    testMode: TEST_MODE,
  };
}

export { normAddress };

// Verify a USDT.b transfer to the treasury and credit 1 per whole USDT.
// In test mode a txHash of "test" skips the chain and grants TEST_CREDITS.
export async function handleBuy(body) {
  const address = normAddress(body.address);
  if (!address) return [400, { error: 'bad address' }];
  const r = getRedis();

  if (TEST_MODE && body.txHash === 'test') {
    const credits = await r.incrby(key.credits(address), TEST_CREDITS);
    return [200, { credited: TEST_CREDITS, credits, test: true }];
  }

  const txHash = typeof body.txHash === 'string' ? body.txHash.toLowerCase() : '';
  if (!/^0x[0-9a-f]{64}$/.test(txHash)) return [400, { error: 'bad txHash' }];
  if (!TREASURY) return [503, { error: 'treasury not configured' }];

  // claim the hash first so a tx can never be credited twice
  const fresh = await r.set(key.tx(txHash), address, 'NX');
  if (!fresh) return [409, { error: 'transaction already credited' }];

  try {
    const receipt = await chain.getTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') throw new Error('transaction failed');

    const treasury = getAddress(TREASURY);
    const transfers = parseEventLogs({
      abi: erc20Abi,
      eventName: 'Transfer',
      logs: receipt.logs,
      strict: false,
    });
    let paid = 0n;
    for (const log of transfers) {
      if (
        getAddress(log.address) === USDT_ADDRESS &&
        log.args?.from &&
        getAddress(log.args.from) === address &&
        getAddress(log.args.to) === treasury
      ) {
        paid += log.args.value;
      }
    }
    const unit = (10n ** BigInt(await getDecimals()) * BigInt(PRICE_E2)) / 100n;
    const bought = Number(paid / unit); // whole credits only
    if (bought < 1) throw new Error('no credit-sized transfer to treasury found in tx');

    const credits = await r.incrby(key.credits(address), bought);
    return [200, { credited: bought, credits }];
  } catch (e) {
    await r.del(key.tx(txHash)); // release the claim so a valid retry can succeed
    return [422, { error: e.shortMessage || e.message }];
  }
}

export async function handleStart(body) {
  const address = normAddress(body.address);
  if (!address) return [400, { error: 'bad address' }];

  const r = getRedis();
  const remaining = await r.decr(key.credits(address));
  if (remaining < 0) {
    await r.incr(key.credits(address));
    return [402, { error: 'no credits' }];
  }

  const ys = genSeries();
  const deal = dealGame(ys);
  const gameId = crypto.randomUUID();
  const startedAt = Date.now();
  await r.set(
    key.game(gameId),
    JSON.stringify({ address, ys, bLimit: deal.bLimit, startedAt }),
    'EX',
    GAME_TTL
  );

  return [200, { gameId, ...clientGameView(ys, deal, 1), credits: remaining }];
}

// Timed reveal: which dots are visible right now, on the server clock.
export async function handleTick(gameId) {
  if (!gameId) return [400, { error: 'bad gameId' }];
  const r = getRedis();
  const raw = await r.get(key.game(gameId));
  if (!raw) return [410, { error: 'game not found or already submitted' }];

  const { ys, startedAt } = JSON.parse(raw);
  const k = dotCount(startedAt, Date.now());
  const locked = k >= LOCK_AT;
  return [
    200,
    {
      k,
      dots: ys.slice(0, Math.min(k, LOCK_AT)), // the runout stays hidden
      locked,
      pointsNow: pointsAfter(Math.min(k, LOCK_AT)),
    },
  ];
}

export async function handleSubmit(body) {
  const gameId = typeof body.gameId === 'string' ? body.gameId : '';
  const b = Number(body.b);
  if (!gameId || !Number.isFinite(b)) return [400, { error: 'bad gameId or b' }];

  const r = getRedis();
  const raw = await r.getdel(key.game(gameId));
  if (!raw) return [410, { error: 'game not found or already submitted' }];

  const { address, ys, bLimit, startedAt } = JSON.parse(raw);
  const fit = olsFit(ys);
  const win = Math.abs(b - fit.b) <= TOLERANCE * 2 * bLimit;
  // Points burn per displayed dot, on the server clock, capped at the lock.
  const k = Math.min(dotCount(startedAt, Date.now()), LOCK_AT);
  const points = win ? pointsAfter(k) : 0;

  await Promise.all([
    r.incr(key.played(address)),
    win ? r.incr(key.won(address)) : Promise.resolve(),
    r.zincrby(key.lb, points, address),
  ]);

  const state = await stateOf(address);
  // pointsWon = this game's award; state.points = the running total.
  return [
    200,
    { series: ys, fit: { a: fit.a, b: fit.b, trendPct: fit.trendPct }, win, pointsWon: points, k, ...state },
  ];
}

async function vnsName(address) {
  const r = getRedis();
  const cached = await r.get(key.vns(address));
  if (cached !== null) return cached;
  let name = '';
  try {
    const names = await chain.readContract({
      address: VNS_REGISTRAR,
      abi: VNS_ABI,
      functionName: 'namesOf',
      args: [address],
    });
    name = names?.[0] || '';
  } catch (e) {
    // leave blank; cache to avoid hammering the RPC
  }
  await r.set(key.vns(address), name, 'EX', VNS_TTL);
  return name;
}

export async function getLeaderboard() {
  const r = getRedis();
  const flat = await r.zrevrange(key.lb, 0, LEADERBOARD_SIZE - 1, 'WITHSCORES');
  const rows = [];
  for (let i = 0; i < flat.length; i += 2) {
    rows.push({ address: flat[i], points: Math.round(parseFloat(flat[i + 1])) });
  }
  const names = await Promise.all(rows.map((row) => vnsName(row.address)));
  return rows.map((row, i) => ({ ...row, name: names[i] }));
}
