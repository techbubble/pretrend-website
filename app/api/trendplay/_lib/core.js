// Server core for the trend game: Redis-backed credits/points ledger,
// timed dot reveal, leaderboard with VNS names, and on-chain USDT.b purchase
// verification. Runs inside Next route handlers on Vercel; Redis comes from
// the marketplace integration (REDIS_URL).

import crypto from 'crypto';
import Redis from 'ioredis';
import { createPublicClient, createWalletClient, defineChain, http, getAddress, erc20Abi, parseEventLogs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
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
} from '../../../trendplay/_lib/gamemath';

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
const VIP_ADDRESS = getAddress(contracts[NETWORK].VIP);
const VIP_ABI = [
  {
    type: 'function',
    name: 'mintAdmin',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'units', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getVIPNFTByOwner',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'units', type: 'uint256' },
        ],
      },
    ],
  },
];
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

const vitruveoChain = defineChain({
  id: NETWORK === 'mainnet' ? 1490 : 14333,
  name: 'Vitruveo',
  nativeCurrency: { name: 'VTRU', symbol: 'VTRU', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

// SERVICE_ROLE signer for VIP.mintAdmin. Unset = conversions accumulate as
// pending in Redis and can be drained once a signer is configured.
function getVipWallet() {
  const pk = process.env.VIP_SIGNER_PRIVATE_KEY;
  if (!pk) return null;
  if (!globalThis.__ptgameVipWallet) {
    globalThis.__ptgameVipWallet = createWalletClient({
      account: privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`),
      chain: vitruveoChain,
      transport: http(RPC_URL),
    });
  }
  return globalThis.__ptgameVipWallet;
}

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
  vipJob: (id) => `ptgame:vipjob:${id}`,
  vipJobs: (a) => `ptgame:vipjobs:${a}`, // per-address index of unsent jobs
  vipPending: (a) => `ptgame:vippending:${a}`,
  vipConverted: (a) => `ptgame:vipconverted:${a}`,
  vipLock: 'ptgame:viplock',
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
  const [credits, played, won, points, vipPending, vipUnits] = await Promise.all([
    r.get(key.credits(address)),
    r.get(key.played(address)),
    r.get(key.won(address)),
    r.zscore(key.lb, address),
    r.get(key.vipPending(address)),
    // Live on-chain VIP units; null (not 0) on read failure so the client
    // keeps its last known value instead of animating a phantom change.
    chain
      .readContract({ address: VIP_ADDRESS, abi: VIP_ABI, functionName: 'getVIPNFTByOwner', args: [address] })
      .then((nft) => Number(nft.units))
      .catch(() => null),
  ]);
  return {
    credits: parseInt(credits || '0', 10),
    played: parseInt(played || '0', 10),
    won: parseInt(won || '0', 10),
    points: Math.round(parseFloat(points || '0')),
    vipPending: parseInt(vipPending || '0', 10),
    vipUnits,
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
    points > 0 ? r.zincrby(key.lb, points, address) : Promise.resolve(),
  ]);
  if (points > 0) await convertPointsToVip(address, points, gameId);

  const state = await stateOf(address);
  // pointsWon = this game's award; state.points = the running total.
  return [
    200,
    { series: ys, fit: { a: fit.a, b: fit.b, trendPct: fit.trendPct }, win, pointsWon: points, k, ...state },
  ];
}

// Silent Web2 -> Web3 conversion: every point won becomes a VIP unit via
// VIP.mintAdmin (mints the NFT if the player has none, else adds units;
// players check their balance in Scope — TrendPlay has no VIP surface).
// Double-spend guards, in order:
//   1. handleSubmit's GETDEL means the win path runs at most once per game.
//   2. The per-game vipJob key is claimed with SET NX before anything else;
//      a replayed conversion finds the claim and stops.
//   3. The on-chain send is serialized behind a Redis lock (nonce safety),
//      and the job's txHash is recorded before counters move.
// Failures leave the job with no txHash and the units in vipPending — owed,
// not lost, and drainable later. vipConverted counts units actually sent.
async function convertPointsToVip(address, points, gameId) {
  const r = getRedis();
  const claimed = await r.set(
    key.vipJob(gameId),
    JSON.stringify({ address, points, at: Date.now() }),
    'NX'
  );
  if (!claimed) return; // already claimed by a previous attempt
  await r.multi().sadd(key.vipJobs(address), gameId).incrby(key.vipPending(address), points).exec();

  const wallet = getVipWallet();
  if (!wallet) return; // no signer configured: stays pending

  const lock = await r.set(key.vipLock, gameId, 'PX', 15000, 'NX');
  if (!lock) return; // another invocation is sending; stays pending
  try {
    await sendVipJob(r, wallet, address, points, gameId);
  } catch (e) {
    console.error('[trendplay] VIP conversion failed, left pending:', gameId, e.shortMessage || e.message);
  } finally {
    await r.del(key.vipLock);
  }
}

// Send one claimed job on-chain and settle its bookkeeping.
async function sendVipJob(r, wallet, address, points, gameId) {
  const hash = await wallet.writeContract({
    address: VIP_ADDRESS,
    abi: VIP_ABI,
    functionName: 'mintAdmin',
    args: [address, BigInt(points)],
  });
  await r
    .multi()
    .set(key.vipJob(gameId), JSON.stringify({ address, points, txHash: hash, at: Date.now() }), 'XX')
    .incrby(key.vipConverted(address), points)
    .decrby(key.vipPending(address), points)
    .srem(key.vipJobs(address), gameId)
    .exec();
  return hash;
}

// Retry every unsent conversion job for an address (user-triggered from the
// flashing Points stat, or any future cron). Safe to call repeatedly: jobs
// that already carry a txHash are only unindexed, never re-sent.
export async function drainVipJobs(body) {
  const address = normAddress(body.address);
  if (!address) return [400, { error: 'bad address' }];

  const r = getRedis();
  const pendingNow = async () => parseInt((await r.get(key.vipPending(address))) || '0', 10);
  const wallet = getVipWallet();
  if (!wallet) return [200, { retried: 0, vipPending: await pendingNow(), reason: 'signer not configured' }];

  const lock = await r.set(key.vipLock, `drain:${address}`, 'PX', 30000, 'NX');
  if (!lock) return [200, { retried: 0, vipPending: await pendingNow(), reason: 'busy, try again' }];

  let retried = 0;
  try {
    const gameIds = await r.smembers(key.vipJobs(address));
    for (const gameId of gameIds) {
      const raw = await r.get(key.vipJob(gameId));
      if (!raw) {
        await r.srem(key.vipJobs(address), gameId);
        continue;
      }
      const job = JSON.parse(raw);
      if (job.txHash) {
        await r.srem(key.vipJobs(address), gameId); // already sent, just unindex
        continue;
      }
      await sendVipJob(r, wallet, job.address, job.points, gameId);
      retried += 1;
    }
  } catch (e) {
    console.error('[trendplay] VIP drain stopped:', e.shortMessage || e.message);
  } finally {
    await r.del(key.vipLock);
  }
  return [200, { retried, vipPending: await pendingNow() }];
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
    const points = Math.round(parseFloat(flat[i + 1]));
    if (points > 0) rows.push({ address: flat[i], points });
  }
  const names = await Promise.all(rows.map((row) => vnsName(row.address)));
  return rows.map((row, i) => ({ ...row, name: names[i] }));
}
