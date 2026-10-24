'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useConfig, useReadContract, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { erc20Abi } from 'viem';
import { vitruveo } from './game-providers';
import { GameRound, fmtAbs } from './game-round';
import { getGameConfig, getGameState, getLeaderboard, getLive, getTick, postBuy, postDrain, postStart, postSubmit } from './api';
import { GAME_S, SOURCE, FEED, FALLBACK_THRESHOLDS, bucketOf, bLimitFor, gameIdFor, gameStartFor, phaseOf, trendAbsOf, tsOls } from '../_lib/gamemath';
import { TRENDPULSE_BASE } from '../../../config/trendpulse';
import { BUCKET_NAMES } from '../../../examples/_components/data/market-replays';
import { Leaderboard } from './leaderboard';

const MONO = 'var(--aw-mono), ui-monospace, monospace';

// Wallet/credits bar is parked until the preview game opens; the live chart
// runs in spectator mode behind a Coming Soon banner.
const SHOW_WALLET_BAR = false;

const ERC20_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
];

const BUY_LABELS = {
  wallet: 'Confirm in wallet…',
  mining: 'Waiting for confirmation…',
  crediting: 'Crediting…',
};

// The sliding five-minute view of the oracle feed, streamed straight from
// TrendPulse: a series fetch reaching back one window on each new game,
// live ticks over the websocket, a periodic refill for gaps, and a 1Hz
// clock (server-skew corrected) that drives phase, elapsed time and the
// live OLS fit over the trailing five minutes. The chart draws the trailing
// points; settlement uses the window's own points on the server.
function useLiveWindow(live) {
  const [state, setState] = useState(null);
  // Server clock skew and lock length live in refs so a refreshed `live`
  // object never tears the stream down: the chart must never blank out.
  const skewRef = useRef(0);
  const lockRef = useRef(240);
  useEffect(() => {
    if (!live) return;
    skewRef.current = live.serverNow - Date.now() / 1000;
    lockRef.current = live.lockS;
  }, [live]);
  const ready = !!live && !!TRENDPULSE_BASE;
  useEffect(() => {
    if (!ready) return undefined;
    const nowS = () => Date.now() / 1000 + skewRef.current;
    let stop = false;
    let ws;
    const cur = { start: null, map: new Map() };

    async function loadWindow(start) {
      try {
        const to = Math.min(Math.floor(nowS()), start + GAME_S - 1);
        const r = await fetch(`${TRENDPULSE_BASE}/series?source=${SOURCE}&from=${start - GAME_S}&to=${to}`);
        const d = await r.json();
        if (stop || cur.start !== start) return;
        for (const p of d.points || []) cur.map.set(p[0], p[1]);
      } catch (e) {
        // next refill retries
      }
    }

    function connect() {
      if (stop) return;
      ws = new WebSocket(`${TRENDPULSE_BASE.replace(/^http/, 'ws')}/feed`);
      ws.onmessage = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'tick' && m.source === SOURCE && cur.start !== null && m.ts >= cur.start - GAME_S) cur.map.set(m.ts, m.value);
        } catch (e) {}
      };
      ws.onclose = () => { if (!stop) setTimeout(connect, 3000); };
      ws.onerror = () => {};
    }
    connect();

    const tick = () => {
      const t = nowS();
      const start = gameStartFor(t);
      if (cur.start !== start) {
        cur.start = start;
        loadWindow(start);
      }
      const floor = Math.floor(t) - GAME_S;
      for (const ts of cur.map.keys()) if (ts < floor) cur.map.delete(ts);
      const trailing = [...cur.map.entries()].sort((a, b) => a[0] - b[0]);
      const points = trailing.filter((p) => p[0] >= start);
      // x measured from the window start, so xbar/a line up with the chart
      const liveFit = trailing.length >= 2 ? tsOls(trailing, start) : null;
      setState({ start, points, trailing, phase: phaseOf(start, t), elapsed: t - start, lockS: lockRef.current, liveFit, now: t });
    };
    tick();
    const clock = setInterval(tick, 1000);
    const refill = setInterval(() => { if (cur.start !== null) loadWindow(cur.start); }, 15000);
    return () => { stop = true; clearInterval(clock); clearInterval(refill); if (ws) ws.close(); };
  }, [ready]);
  return state;
}

function fmtClock(s) {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function TickerRow({ items }) {
  return (
    <>
      {items.map(([label, value, tone]) => (
        <span key={label} className="aw-tick">
          <span className="aw-faint">{label}</span>
          <span className={tone === 'ember' ? 'aw-ember' : tone === 'signal' ? 'aw-signal' : 'aw-ink'}>{value}</span>
        </span>
      ))}
    </>
  );
}

// Live telemetry strip in the AI Wars ticker style, fed by the real window.
function Ticker({ win, thresholds, calibration }) {
  const last = win?.points.length ? win.points[win.points.length - 1][1] : null;
  const fit = win?.liveFit;
  const projected = fit ? trendAbsOf(fit.b) : null;
  const bucket = projected === null ? -1 : bucketOf(projected, thresholds);
  const items = [
    [FEED.name, last === null ? '…' : last.toFixed(0), 'ink'],
    ['LIVE OLS', projected === null ? '…' : fmtAbs(projected), projected !== null && projected >= 0 ? 'signal' : 'ember'],
    ['BUCKET', bucket >= 0 ? BUCKET_NAMES[bucket].toUpperCase() : '…', 'ink'],
    ['PHASE', win ? win.phase.toUpperCase() : '…', win?.phase === 'open' ? 'signal' : 'ember'],
    [win?.phase === 'open' ? 'BETTING CLOSES' : 'NEXT GAME', win ? fmtClock((win.phase === 'open' ? win.lockS : GAME_S) - win.elapsed) : '…', 'ink'],
    ['SIGNAL CADENCE', `${FEED.cadenceS}S`, 'ink'],
    ['MARKET WINDOW', '5M', 'ink'],
    ['CALIBRATION', calibration?.fallback ? 'FALLBACK' : `${calibration?.windows ?? 0} WINDOWS`, calibration?.fallback ? 'ember' : 'ink'],
    ['ARCHIVE STATUS', 'SEALED', 'ember'],
  ];
  return (
    <div className="aw-ticker">
      <div className="aw-marquee">
        <TickerRow items={items} />
        <TickerRow items={items} />
      </div>
    </div>
  );
}

export function GameApp() {
  const { address, chain, isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const { writeContractAsync } = useWriteContract();
  const onVitruveo = chain?.id === vitruveo.id;

  const [cfg, setCfg] = useState(null);
  const [cfgError, setCfgError] = useState(null);
  const [live, setLive] = useState(null);
  const [stats, setStats] = useState({ credits: 0, played: 0, won: 0, points: 0, vipPending: 0, vipUnits: 0 });
  const [lbRows, setLbRows] = useState([]);
  const [qty, setQty] = useState(5);
  const [buyStatus, setBuyStatus] = useState(null);
  const [entry, setEntry] = useState(null);
  const [result, setResult] = useState(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [vipRetryUsed, setVipRetryUsed] = useState(false);
  const vipBaseline = useRef(null);

  const win = useLiveWindow(live);
  const thresholds = entry?.thresholds || live?.thresholds || FALLBACK_THRESHOLDS;
  const bLimit = entry?.bLimit || live?.bLimit || bLimitFor(FALLBACK_THRESHOLDS);

  useEffect(() => {
    getGameConfig().then(setCfg).catch((e) => setCfgError(e.message));
    getLive().then(setLive).catch((e) => setCfgError(e.message));
    getLeaderboard().then((r) => setLbRows(r.rows)).catch(() => {});
    // re-read the clock and calibration every few minutes
    const id = setInterval(() => getLive().then(setLive).catch(() => {}), 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: cfg?.usdt,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: vitruveo.id,
    query: { enabled: !!cfg && !!address, refetchInterval: 30000 },
  });
  const creditUnit = cfg ? (10n ** BigInt(cfg.usdtDecimals) * BigInt(cfg.creditPriceE2)) / 100n : 0n;
  const maxCredits = cfg && balance !== undefined ? Number(balance / creditUnit) : 0;

  useEffect(() => {
    setQty((q) => Math.min(Math.max(q, 1), Math.max(1, maxCredits)));
  }, [maxCredits]);

  const refresh = useCallback(() => {
    if (!address) return;
    getGameState(address)
      .then((d) => {
        setStats((s) => ({ ...d, vipUnits: d.vipUnits ?? s.vipUnits }));
        if (vipBaseline.current === null && d.vipUnits != null) vipBaseline.current = d.vipUnits;
      })
      .catch(() => {});
  }, [address]);

  // On connect (or reload mid-game) restore any entry in the current window.
  useEffect(() => {
    setEntry(null);
    setResult(null);
    setError(null);
    setStats({ credits: 0, played: 0, won: 0, points: 0, vipPending: 0, vipUnits: 0 });
    vipBaseline.current = null;
    refresh();
    if (!address || !live) return;
    const start = gameStartFor(live.serverNow + (Date.now() / 1000 - live.serverNow));
    getTick(gameIdFor(start), address)
      .then((t) => { if (!t.settled) setEntry({ ...t, thresholds: t.thresholds, bLimit: t.bLimit }); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refresh, !!live]);

  // Once the player's window has ended, poll for the settled result.
  useEffect(() => {
    if (!entry || result || !win || !address) return undefined;
    const ph = phaseOf(entry.start, win.now);
    if (ph !== 'settling' && ph !== 'ended') return undefined;
    let stop = false;
    const poll = async () => {
      try {
        const r = await getTick(entry.gameId, address);
        if (stop) return;
        if (r.settled) {
          setResult({ ...r, start: entry.start });
          setStats((s) => ({ ...s, credits: r.credits, played: r.played, won: r.won, points: r.points, vipPending: r.vipPending, vipUnits: r.vipUnits ?? s.vipUnits }));
          getLeaderboard().then((lb) => setLbRows(lb.rows)).catch(() => {});
          setTimeout(refresh, 6000);
          setTimeout(refresh, 15000);
        }
      } catch (e) {
        if (!stop && /not in this game/.test(e.message)) setEntry(null);
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => { stop = true; clearInterval(id); };
  }, [entry, result, win?.phase, win?.start, address, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const buy = async () => {
    setError(null);
    try {
      if (cfg.testMode) {
        setBuyStatus('crediting');
        const r = await postBuy(address, 'test');
        setStats((s) => ({ ...s, credits: r.credits }));
        setBuyStatus(null);
        return;
      }
      setBuyStatus('wallet');
      const hash = await writeContractAsync({
        address: cfg.usdt,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [cfg.treasury, BigInt(qty) * creditUnit],
        chainId: vitruveo.id,
      });
      setBuyStatus('mining');
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: vitruveo.id });
      setBuyStatus('crediting');
      const r = await postBuy(address, hash);
      setStats((s) => ({ ...s, credits: r.credits }));
      refetchBalance();
    } catch (e) {
      setError(e.shortMessage || e.message);
    } finally {
      setBuyStatus(null);
    }
  };

  const join = async () => {
    setError(null);
    setStarting(true);
    try {
      const g = await postStart(address);
      setResult(null);
      setEntry(g);
      setStats((s) => ({ ...s, credits: g.credits }));
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  const submit = useCallback(async (b) => {
    if (!entry || entry.submitted) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await postSubmit(entry.gameId, address, b);
      setEntry((e) => (e ? { ...e, submitted: true, b, k: r.k } : e));
    } catch (e) {
      if (/already submitted/.test(e.message)) setEntry((en) => (en ? { ...en, submitted: true } : en));
      else setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [entry, address]);

  const dismiss = () => {
    setResult(null);
    setEntry(null);
  };

  const retryVip = async () => {
    if (!address || stats.vipPending < 1 || vipRetryUsed) return;
    setVipRetryUsed(true);
    try {
      await postDrain(address);
    } catch (e) {}
    refresh();
  };

  const canBuy = cfg?.testMode
    ? isConnected && !buyStatus
    : isConnected && onVitruveo && cfg && cfg.treasury && !buyStatus && maxCredits >= 1 && qty <= maxCredits;
  const canJoin = isConnected && onVitruveo && stats.credits > 0 && !!cfg && !!live && !starting;
  const joinHint = !isConnected
    ? 'connect your wallet on Vitruveo to play'
    : !onVitruveo
      ? 'switch your wallet to the Vitruveo network to play'
      : stats.credits < 1
        ? 'you need at least 1 credit to play'
        : 'playing uses 1 credit for this window';

  // While the player's own window is settling, keep showing the live feed
  // but with their entry in view; the result replaces it once it lands.
  const entryIsCurrent = entry && win && entry.start === win.start;

  return (
    <div className="aw" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <Ticker win={win} thresholds={thresholds} calibration={live?.calibration} />

      {SHOW_WALLET_BAR ? (
        <div className="aw-panel p-3 p-md-4 mb-4 mt-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="aw-stat">
            <div className="aw-stat-label">Credits</div>
            <div className="aw-stat-value aw-ink">{stats.credits.toLocaleString('en-US')}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <input
              type="range"
              className="form-range aw-range"
              style={{ width: '140px' }}
              min={1}
              max={Math.max(1, maxCredits)}
              step={1}
              value={qty}
              disabled={maxCredits < 1}
              onChange={(e) => setQty(parseInt(e.target.value, 10))}
              aria-label="Number of credits to buy"
            />
          </div>
          <button type="button" className="aw-btn aw-btn-sm" onClick={buy} disabled={!canBuy}>
            {buyStatus ? BUY_LABELS[buyStatus] : 'Buy'}
          </button>
          <div className="aw-stat ms-md-auto">
            <div className="aw-stat-label">Played</div>
            <div className="aw-stat-value">{stats.played.toLocaleString('en-US')}</div>
          </div>
          <div className="aw-stat">
            <div className="aw-stat-label">Won</div>
            <div className="aw-stat-value">{stats.won.toLocaleString('en-US')}</div>
          </div>
          <div
            className="aw-stat"
            onClick={retryVip}
            title={
              stats.vipPending > 0
                ? vipRetryUsed
                  ? `${stats.vipPending} units still pending — reload the page to retry again`
                  : `${stats.vipPending} units not yet on-chain — click to retry`
                : undefined
            }
            style={stats.vipPending > 0 && !vipRetryUsed ? { cursor: 'pointer' } : undefined}
          >
            <div className="aw-stat-label">Points</div>
            <div
              className={`aw-stat-value${stats.vipPending > 0 && !vipRetryUsed ? ' tp-points-alert' : ''}`}
              style={stats.vipPending > 0 ? (vipRetryUsed ? { color: '#f87171' } : undefined) : { color: '#f0954f' }}
            >
              {stats.points.toLocaleString('en-US')}
            </div>
          </div>
          <div className={`aw-stat${vipBaseline.current !== null && stats.vipUnits !== vipBaseline.current ? ' tp-vip-changed' : ''}`}>
            <div className="aw-stat-label">VIP Units</div>
            <div className="aw-stat-value aw-ink">{(stats.vipUnits ?? 0).toLocaleString('en-US')}</div>
          </div>
        </div>
        <div className="mt-2 aw-dim" style={{ fontFamily: MONO, fontSize: '0.95rem', letterSpacing: '0.04em' }}>
          Buy <span className="aw-ink">{qty}</span> credit{qty > 1 ? 's' : ''} for{' '}
          <span className="aw-ink">{(qty * (cfg?.creditPriceUsdt ?? 0.99)).toFixed(2)} USDT.b</span>
          {' '}&middot; each game uses 1 credit
          {isConnected && cfg && balance !== undefined ? (
            <> &middot; balance {(Number(balance / 10n ** BigInt(cfg.usdtDecimals - 2)) / 100).toFixed(2)} USDT.b</>
          ) : null}
        </div>
        {(error || cfgError || (cfg && !cfg.treasury) || (isConnected && onVitruveo && cfg && maxCredits < 1)) && (
          <div className="mt-2" style={{ fontFamily: MONO, fontSize: '0.85rem', color: '#f87171' }}>
            {cfgError
              ? `Game service unreachable: ${cfgError}`
              : error
                ? error
                : cfg && !cfg.treasury
                  ? 'Buying is disabled: TREASURY_ADDRESS is not configured on the server.'
                  : (
                    <>
                      No USDT.b in this wallet &mdash;{' '}
                      <a href="https://scope.vitruveo.ai/bridge/usdt" target="_blank" rel="noopener noreferrer" style={{ color: '#f87171', textDecorationLine: 'underline' }}>
                        bridge some first
                      </a>.
                    </>
                  )}
          </div>
        )}
      </div>
      ) : null}

      {/* The live window */}
      <div className="aw-panel p-3 p-md-4">
        {win ? (
          <>
            <GameRound
              key={result ? `r${result.start}` : 'live'}
              win={win}
              thresholds={thresholds}
              bLimit={bLimit}
              entry={entryIsCurrent || result ? entry : null}
              result={result}
              submitting={submitting}
              onSubmit={submit}
              onJoin={join}
              canJoin={SHOW_WALLET_BAR && canJoin}
              joinHint={SHOW_WALLET_BAR ? joinHint : 'spectator mode until the preview opens'}
              comingSoon={!SHOW_WALLET_BAR}
              onDismiss={dismiss}
            />
            {entry && !entryIsCurrent && !result && (
              <p className="text-center mt-2 mb-0 aw-faint" style={{ fontFamily: MONO, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                YOUR {new Date(entry.start * 1000).toISOString().slice(11, 16)} UTC GAME IS SETTLING&hellip;
              </p>
            )}
          </>
        ) : (
          <div style={{ minHeight: '420px' }} className="d-flex align-items-center justify-content-center aw-faint">
            <span style={{ fontFamily: MONO, letterSpacing: '0.2em' }}>
              {cfgError ? 'GAME SERVICE UNREACHABLE' : 'CONNECTING TO TRENDPULSE…'}
            </span>
          </div>
        )}
      </div>

      <p className="aw-faint mt-3 mb-0" style={{ fontFamily: MONO, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {FEED.note}
      </p>

      {SHOW_WALLET_BAR && <Leaderboard rows={lbRows} myAddress={address} />}
    </div>
  );
}
