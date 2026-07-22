'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, useConfig, useReadContract, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { erc20Abi } from 'viem';
import { vitruveo } from './game-providers';
import { GameRound } from './game-round';
import { getGameConfig, getGameState, getLeaderboard, postBuy, postDrain, postStart, postSubmit } from './api';
import { genSeries, dealGame, clientGameView, LOCK_AT } from '../_lib/gamemath';
import { Leaderboard } from './leaderboard';

const FONT = "'Titillium Web',sans-serif";

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

export function GameApp() {
  const { address, chain, isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const { writeContractAsync } = useWriteContract();
  const onVitruveo = chain?.id === vitruveo.id;

  const [cfg, setCfg] = useState(null);
  const [cfgError, setCfgError] = useState(null);
  const [stats, setStats] = useState({ credits: 0, played: 0, won: 0, points: 0, vipPending: 0 });
  const [lbRows, setLbRows] = useState([]);
  const [qty, setQty] = useState(5);
  const [buyStatus, setBuyStatus] = useState(null);
  const [game, setGame] = useState(null);
  const [result, setResult] = useState(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewGame, setPreviewGame] = useState(null);

  useEffect(() => {
    getGameConfig().then(setCfg).catch((e) => setCfgError(e.message));
    // Free-spin preview so the chart is visible before connecting; generated
    // client-side after mount to avoid a hydration mismatch.
    const ys = genSeries();
    setPreviewGame(clientGameView(ys, dealGame(ys), LOCK_AT));
    getLeaderboard().then((r) => setLbRows(r.rows)).catch(() => {});
  }, []);

  // Slider max = whole USDT.b in the wallet.
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: cfg?.usdt,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: vitruveo.id,
    query: { enabled: !!cfg && !!address, refetchInterval: 30000 },
  });
  // One credit costs creditPriceE2/100 USDT.b, in token units.
  const creditUnit = cfg ? (10n ** BigInt(cfg.usdtDecimals) * BigInt(cfg.creditPriceE2)) / 100n : 0n;
  const maxCredits = cfg && balance !== undefined ? Number(balance / creditUnit) : 0;

  useEffect(() => {
    setQty((q) => Math.min(Math.max(q, 1), Math.max(1, maxCredits)));
  }, [maxCredits]);

  const refresh = useCallback(() => {
    if (!address) return;
    getGameState(address).then(setStats).catch(() => {});
  }, [address]);

  useEffect(() => {
    setGame(null);
    setResult(null);
    setError(null);
    setStats({ credits: 0, played: 0, won: 0, points: 0, vipPending: 0 });
    refresh();
  }, [address, refresh]);

  const buy = async () => {
    setError(null);
    try {
      // Localhost test mode: go through the motions, no chain transaction.
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

  const start = async () => {
    setError(null);
    setStarting(true);
    try {
      const g = await postStart(address);
      setResult(null);
      setGame(g);
      setStats((s) => ({ ...s, credits: g.credits }));
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  const submit = async (b) => {
    setError(null);
    setSubmitting(true);
    try {
      const r = await postSubmit(game.gameId, b);
      setResult(r);
      setStats({ credits: r.credits, played: r.played, won: r.won, points: r.points, vipPending: r.vipPending });
      getLeaderboard().then((lb) => setLbRows(lb.rows)).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Test mode (localhost) skips the chain entirely — only a connected address
  // to credit is needed; every buy grants the fixed test amount.
  // Pending VIP units = won points not yet issued on-chain; clicking the
  // flashing Points stat retries the conversion jobs.
  const retryVip = async () => {
    if (!address || stats.vipPending < 1) return;
    try {
      await postDrain(address);
    } catch (e) {
      // refresh below reflects whatever actually happened
    }
    refresh();
  };

  const canBuy = cfg?.testMode
    ? isConnected && !buyStatus
    : isConnected && onVitruveo && cfg && cfg.treasury && !buyStatus && maxCredits >= 1 && qty <= maxCredits;

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
      {/* Credits / buy bar */}
      <div className="card-dark p-3 p-md-4 mb-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="mr-stat">
            <div className="mr-stat-label">Credits</div>
            <div className="mr-stat-value text-white">{stats.credits}</div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-grow-1 tp-buy-group" style={{ minWidth: '220px' }}>
            <input
              type="range"
              className="form-range flex-grow-1"
              min={1}
              max={Math.max(1, maxCredits)}
              step={1}
              value={qty}
              disabled={maxCredits < 1}
              onChange={(e) => setQty(parseInt(e.target.value, 10))}
              aria-label="Number of credits to buy"
            />
            <span className="text-white" style={{ fontFamily: FONT, whiteSpace: 'nowrap' }}>
              {qty} credit{qty > 1 ? 's' : ''} &middot; {(qty * (cfg?.creditPriceUsdt ?? 0.99)).toFixed(2)} USDT.b
            </span>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={buy} disabled={!canBuy}>
            {buyStatus ? BUY_LABELS[buyStatus] : 'Buy'}
          </button>
          <div className="mr-stat ms-md-auto">
            <div className="mr-stat-label">Played</div>
            <div className="mr-stat-value">{stats.played}</div>
          </div>
          <div className="mr-stat">
            <div className="mr-stat-label">Won</div>
            <div className="mr-stat-value">{stats.won}</div>
          </div>
          <div
            className="mr-stat"
            onClick={retryVip}
            title={stats.vipPending > 0 ? `${stats.vipPending} units not yet on-chain — click to retry` : undefined}
            style={stats.vipPending > 0 ? { cursor: 'pointer' } : undefined}
          >
            <div className="mr-stat-label">Points</div>
            <div
              className={`mr-stat-value${stats.vipPending > 0 ? ' tp-points-alert' : ''}`}
              style={stats.vipPending > 0 ? undefined : { color: '#e8c547' }}
            >
              {stats.points}
            </div>
          </div>
        </div>
        <div className="mt-2" style={{ fontFamily: FONT, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
          1 credit = {(cfg?.creditPriceUsdt ?? 0.99).toFixed(2)} USDT.b on Vitruveo &middot; each game uses 1 credit
          {isConnected && cfg && balance !== undefined ? (
            <> &middot; balance {(Number(balance / 10n ** BigInt(cfg.usdtDecimals - 2)) / 100).toFixed(2)} USDT.b</>
          ) : null}
        </div>
        {(error || cfgError || (cfg && !cfg.treasury) || (isConnected && onVitruveo && cfg && maxCredits < 1)) && (
          <div className="mt-2" style={{ fontFamily: FONT, fontSize: '0.85rem', color: '#f87171' }}>
            {cfgError
              ? `Game service unreachable: ${cfgError}`
              : error
                ? error
                : cfg && !cfg.treasury
                  ? 'Buying is disabled: TREASURY_ADDRESS is not configured on the server.'
                  : (
                    <>
                      No USDT.b in this wallet &mdash;{' '}
                      <a
                        href="https://scope.vitruveo.ai/bridge/usdt"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#f87171', textDecorationLine: 'underline' }}
                      >
                        bridge some first
                      </a>.
                    </>
                  )}
          </div>
        )}
      </div>

      {/* Game — chart is always visible; the action button gates on wallet/credits */}
      <div className="card-dark p-3 p-md-4">
        {game || previewGame ? (
          <>
            <GameRound
              key={game ? game.gameId : 'preview'}
              game={game || previewGame}
              result={result}
              submitting={submitting}
              onSubmit={submit}
              onPlayAgain={start}
              canReplay={stats.credits > 0 && !starting}
              preview={!game}
              onPlay={start}
              canPlay={isConnected && onVitruveo && stats.credits > 0 && !!cfg && !starting}
            />
            {!game && (
              <p className="text-muted-custom text-center mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
                {!isConnected
                  ? 'Connect your wallet on Vitruveo to play.'
                  : !onVitruveo
                    ? 'Switch your wallet to the Vitruveo network to play.'
                    : stats.credits < 1
                      ? 'You need at least 1 credit to play.'
                      : 'Ready — playing uses 1 credit and deals a fresh market.'}
              </p>
            )}
          </>
        ) : (
          <div style={{ minHeight: '420px' }} />
        )}
      </div>

      <Leaderboard rows={lbRows} myAddress={address} />
    </div>
  );
}
