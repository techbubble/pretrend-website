// Server core for the live trend game: Redis-backed credits/points ledger,
// 5-minute aiwars-momentum game windows settled against the TrendPulse oracle,
// leaderboard with VNS names, and on-chain USDT.b purchase verification. Runs inside Next route handlers on Vercel; Redis comes from
// the marketplace integration (REDIS_URL).

import crypto from 'crypto';
import Redis from 'ioredis';
import { createPublicClient, createWalletClient, defineChain, http, getAddress, erc20Abi, parseEventLogs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import contracts from '../../../../config/vtru-contracts.json';
import {
  SOURCE,
  GAME_S,
  LOCK_S,
  SETTLE_DELAY_S,
  TOLERANCE,
  MIN_SETTLE_POINTS,
  gameStartFor,
  gameIdFor,
  parseGameId,
  tsOls,
  bLimitFor,
  pointsAt,
  phaseOf,
} from '../../../market/aiwars/_lib/gamemath';
import { fetchSeries, getCalibration } from './live';

const NETWORK = process.env.VTRU_NETWORK || 'mainnet';
const RPC_URL = process.env.VTRU_RPC_URL || 'https://rpc.vitruveo.ai';
const TREASURY = process.env.TREASURY_ADDRESS || '';
const BRIDGE_URL = 'https://scope.vitruveo.ai/bridge/usdt';
const GAME_TTL = 86400; // seconds; live game entries and settled fits
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
  entry: (start, a) => `ptgame:live:${start}:${a}`,
  fit: (start) => `ptgame:live:fit:${start}`,
  settled: (start, a) => `ptgame:live:settled:${start}:${a}`,
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

const nowS = () => Math.floor(Date.now() / 1000);

// Public description of the live game clock and bucket calibration.
export async function handleLive() {
  let redis = null;
  try { redis = getRedis(); } catch (e) { /* calibration still works without Redis */ }
  const cal = await getCalibration(redis);
  const now = nowS();
  const start = gameStartFor(now);
  return [
    200,
    {
      source: SOURCE,
      gameS: GAME_S,
      lockS: LOCK_S,
      settleDelayS: SETTLE_DELAY_S,
      serverNow: now,
      start,
      gameId: gameIdFor(start),
      phase: phaseOf(start, now),
      thresholds: cal.thresholds,
      bLimit: bLimitFor(cal.thresholds),
      calibration: { windows: cal.windows, calibratedAt: cal.calibratedAt, fallback: !!cal.fallback },
    },
  ];
}

// Join the current 5-minute window. One credit per window per address; a
// second call during the same window returns the existing entry unchanged.
export async function handleStart(body) {
  const address = normAddress(body.address);
  if (!address) return [400, { error: 'bad address' }];

  const r = getRedis();
  const now = nowS();
  const start = gameStartFor(now);
  if (phaseOf(start, now) !== 'open') {
    return [423, { error: 'betting is closed for this game', nextStart: start + GAME_S }];
  }

  const existing = await r.get(key.entry(start, address));
  if (existing) {
    const e = JSON.parse(existing);
    const credits = parseInt((await r.get(key.credits(address))) || '0', 10);
    return [200, { ...entryView(e), credits }];
  }

  const remaining = await r.decr(key.credits(address));
  if (remaining < 0) {
    await r.incr(key.credits(address));
    return [402, { error: 'no credits' }];
  }

  const cal = await getCalibration(r);
  const entry = {
    address,
    start,
    joinedAt: now,
    thresholds: cal.thresholds,
    bLimit: bLimitFor(cal.thresholds),
    b: null,
    k: null,
  };
  const fresh = await r.set(key.entry(start, address), JSON.stringify(entry), 'EX', GAME_TTL, 'NX');
  if (!fresh) {
    // raced with another tab: refund and hand back the entry that won
    await r.incr(key.credits(address));
    const e = JSON.parse(await r.get(key.entry(start, address)));
    const credits = parseInt((await r.get(key.credits(address))) || '0', 10);
    return [200, { ...entryView(e), credits }];
  }
  return [200, { ...entryView(entry), credits: remaining }];
}

function entryView(e) {
  return {
    gameId: gameIdFor(e.start),
    start: e.start,
    gameS: GAME_S,
    lockS: LOCK_S,
    settleDelayS: SETTLE_DELAY_S,
    thresholds: e.thresholds,
    bLimit: e.bLimit,
    joinedAt: e.joinedAt,
    b: e.b,
    k: e.k,
    submitted: e.b !== null && e.b !== undefined,
  };
}

// Record the player's slope. Accepted until the lock (plus a short grace for
// the client's auto-submit at the lock); one submission per game.
export async function handleSubmit(body) {
  const start = parseGameId(body.gameId);
  const address = normAddress(body.address);
  const b = Number(body.b);
  if (start === null || !address || !Number.isFinite(b)) return [400, { error: 'bad gameId, address or b' }];

  const r = getRedis();
  const raw = await r.get(key.entry(start, address));
  if (!raw) return [410, { error: 'not in this game' }];
  const entry = JSON.parse(raw);
  if (entry.b !== null && entry.b !== undefined) return [409, { error: 'already submitted' }];

  const now = Date.now() / 1000;
  const elapsed = now - start;
  if (elapsed > LOCK_S + 3) return [423, { error: 'betting is closed' }];

  entry.b = Math.max(-entry.bLimit, Math.min(entry.bLimit, b));
  entry.k = Math.max(0, Math.min(LOCK_S, Math.floor(elapsed)));
  entry.submittedAt = now;
  await r.set(key.entry(start, address), JSON.stringify(entry), 'EX', GAME_TTL, 'XX');
  return [200, { accepted: true, k: entry.k, pointsIfWin: pointsAt(entry.k), settlesAt: start + GAME_S + SETTLE_DELAY_S }];
}

// Game clock and, once the window has ended, the settled result.
export async function handleTick(gameId, addressRaw) {
  const start = parseGameId(gameId);
  const address = normAddress(addressRaw);
  if (start === null || !address) return [400, { error: 'bad gameId or address' }];

  const r = getRedis();
  const now = nowS();
  const phase = phaseOf(start, now);
  const raw = await r.get(key.entry(start, address));
  if (!raw) return [410, { error: 'not in this game' }];
  let entry = JSON.parse(raw);

  if (phase !== 'ended') {
    return [200, { phase, serverNow: now, ...entryView(entry), pointsNow: pointsAt(now - start) }];
  }

  if (!entry.settled) entry = await settleEntry(r, entry);
  const fitRec = await settledFit(r, start);
  const state = await stateOf(address);
  return [
    200,
    {
      phase,
      serverNow: now,
      ...entryView(entry),
      settled: true,
      void: !!entry.void,
      win: !!entry.win,
      pointsWon: entry.points || 0,
      series: fitRec.series,
      fit: fitRec.fit,
      ...state,
    },
  ];
}

// The window's final series and OLS fit, fetched from the oracle once and
// shared by every player of that window.
async function settledFit(r, start) {
  const cached = await r.get(key.fit(start));
  if (cached) return JSON.parse(cached);
  const series = await fetchSeries(start, start + GAME_S - 1);
  series.sort((x, y) => x[0] - y[0]);
  const fit = series.length >= MIN_SETTLE_POINTS ? tsOls(series, start) : null; // x measured from window start, as drawn
  const rec = { series, fit, void: !fit };
  await r.set(key.fit(start), JSON.stringify(rec), 'EX', GAME_TTL);
  return rec;
}

// Settle one player's entry exactly once. A void game (oracle gap) refunds
// the credit instead of counting as a loss.
async function settleEntry(r, entry) {
  const { address, start } = entry;
  const claimed = await r.set(key.settled(start, address), '1', 'EX', GAME_TTL, 'NX');
  if (!claimed) {
    // another request is settling or has settled; wait briefly and re-read
    for (let i = 0; i < 10; i++) {
      await new Promise((res) => setTimeout(res, 200));
      const e = JSON.parse((await r.get(key.entry(start, address))) || 'null');
      if (e?.settled) return e;
    }
    return { ...entry, settled: true, win: false, points: 0 };
  }

  const fitRec = await settledFit(r, start);
  const submitted = entry.b !== null && entry.b !== undefined;
  const win = !fitRec.void && submitted && Math.abs(entry.b - fitRec.fit.b) <= TOLERANCE * 2 * entry.bLimit;
  const points = win ? pointsAt(entry.k) : 0;

  if (fitRec.void) {
    await r.incr(key.credits(address));
  } else {
    await Promise.all([
      r.incr(key.played(address)),
      win ? r.incr(key.won(address)) : Promise.resolve(),
      points > 0 ? r.zincrby(key.lb, points, address) : Promise.resolve(),
    ]);
    if (points > 0) await convertPointsToVip(address, points, `${gameIdFor(start)}:${address}`);
  }

  const settled = { ...entry, settled: true, void: fitRec.void, win, points, settledAt: nowS() };
  await r.set(key.entry(start, address), JSON.stringify(settled), 'EX', GAME_TTL);
  return settled;
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
