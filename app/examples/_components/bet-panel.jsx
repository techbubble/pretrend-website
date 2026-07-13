'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BUCKET_NAMES } from './data/market-replays';
import { BUCKET_COLORS, BUCKET_DESCS, bucketRgba } from './bucket-meta';
import { MarketReplay } from './market-replay';

// Mirrors the wpb-* CSS timeline: 20s loop, market open at 10%, close at 70%.
// A bet placed at minute t of the 30-minute market appears at (10 + 2t)% of the loop.
const LOOP_MS = 20000;
const OPEN = 0.10;
const CLOSE = 0.70;
const BASE = 0.2;
const K = 500;

const betFrac = (t) => OPEN + (t / 30) * (CLOSE - OPEN);

function fmtMoney(v) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(v, decimals = 2) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`;
}

export function BetPanel({ market, onReplay }) {
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setNow(1);
      setDone(true);
      return undefined;
    }
    const start = performance.now();
    const id = setInterval(() => {
      const elapsed = performance.now() - start;
      if (elapsed >= LOOP_MS) {
        setNow(1);
        setDone(true);
        clearInterval(id);
      } else {
        setNow(elapsed / LOOP_MS);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  const visible = market.bets.filter((b) => betFrac(b.t) <= now);
  const closed = now >= CLOSE;

  // live: newest bet on top; settled: winners slide to the top, both groups in time order
  const rows = closed
    ? [...market.bets].sort(
        (a, b) =>
          (a.bucket === market.winner ? 0 : 1) - (b.bucket === market.winner ? 0 : 1) || a.t - b.t
      )
    : [...visible].reverse();

  // FLIP: animate rows sliding to their new positions when the order changes
  const rowEls = useRef(new Map());
  const lastTops = useRef(new Map());
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prev = lastTops.current;
    const next = new Map();
    for (const [key, el] of rowEls.current) {
      next.set(key, el.getBoundingClientRect().top);
    }
    if (!reduce) {
      for (const [key, el] of rowEls.current) {
        const before = prev.get(key);
        const after = next.get(key);
        if (before != null && after != null && Math.abs(before - after) > 1) {
          el.style.transition = 'none';
          el.style.transform = `translateY(${before - after}px)`;
          requestAnimationFrame(() => {
            el.style.transition = 'transform 0.6s ease';
            el.style.transform = '';
          });
        }
      }
    }
    lastTops.current = next;
  });

  // settlement: 2.75% off the bounty, winners split the rest by unit share
  const distributable = market.bounty * (1 - 0.0275);
  const winUnits = market.bets
    .filter((b) => b.bucket === market.winner)
    .reduce((sum, b) => sum + b.units, 0);
  const payout = (b) => (b.units / winUnits) * distributable;

  const units = [0, 0, 0, 0, 0];
  const pools = [0, 0, 0, 0, 0];
  for (const b of visible) {
    units[b.bucket] += b.units;
    pools[b.bucket] += b.amount;
  }
  const prices = units.map((u) => BASE * (1 + u / K));

  // AI market insight commentary, staged to the replay timeline (see whitepaper 14.1)
  const stage = now < OPEN ? 0 : now < 0.4 ? 1 : now < CLOSE ? 2 : 3;
  const totalPool = pools.reduce((a, b) => a + b, 0);
  const topPool = totalPool > 0 ? pools.indexOf(Math.max(...pools)) : null;
  const winCount = market.bets.filter((b) => b.bucket === market.winner).length;
  const q = market.thresholds;
  const insight = [
    `Pre-market. Fifteen minutes of lead-in BTC data are on screen for context. Thirty days of history set the Flat band at ${fmtPct(q[1])} to ${fmtPct(q[2])}, and every bucket opens at $0.20.`,
    `Market open, ${market.tOpen}. Thresholds are locked and the trend line stays hidden until ${market.tMid}. ${
      topPool !== null
        ? `Early money favors ${BUCKET_NAMES[topPool]}, and its price is climbing.`
        : 'Waiting for the first bets to arrive.'
    }`,
    `Trend revealed: ${fmtPct(market.trendHalf, 3)}, tracking ${BUCKET_NAMES[market.interim]}. The trajectory is public now, and late money tends to chase the visible band${
      topPool !== null ? `; the largest pool is ${BUCKET_NAMES[topPool]}` : ''
    }.`,
    `Resolved: final trend ${fmtPct(market.trendFull, 3)}, ${BUCKET_NAMES[market.winner]} wins${
      market.interim !== market.winner
        ? `, a reversal from ${BUCKET_NAMES[market.interim]} at the reveal`
        : ''
    }. ${winCount} of ${market.bets.length} positions finish in the money and split ${fmtMoney(distributable)}.`,
  ][stage];
  // flash a tile briefly when a bet lands in it
  const flashing = prices.map((_, i) =>
    visible.some((b) => b.bucket === i && now - betFrac(b.t) < 0.025)
  );

  return (
    <div>
      <div className="mr-prices">
        {BUCKET_NAMES.map((name, i) => {
          const won = closed && i === market.winner;
          const style = won
            ? { borderColor: BUCKET_COLORS[i], background: bucketRgba(i, 0.13) }
            : flashing[i]
              ? { borderColor: bucketRgba(i, 0.6), background: bucketRgba(i, 0.07) }
              : undefined;
          return (
            <div key={name} className="mr-price-tile" style={style}>
              <div className="mr-price-bucket" style={{ color: BUCKET_COLORS[i] }}>{name}</div>
              <div className="mr-price-desc">{BUCKET_DESCS[i]}</div>
              <div className="mr-price-value" style={won ? { color: BUCKET_COLORS[i] } : undefined}>
                {fmtMoney(prices[i])}
              </div>
              <div className="mr-price-pool">{pools[i] > 0 ? `$${pools[i]} in` : '—'}</div>
            </div>
          );
        })}
      </div>
      <div className="mr-chart">
        <div className="mr-chart-plot">
          <MarketReplay market={market} now={now} />
          {done && (
            <button type="button" className="mr-replay-btn" onClick={onReplay} aria-label="Replay market">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
                <path d="M4.1 1.6v2.9h2.9" />
              </svg>
              Replay
            </button>
          )}
        </div>
        <div className="wp-ai-card">
          <div className="wp-ai-head"><span className="wp-ai-dot" />AI Market Insight</div>
          <div className="wp-ai-body">
            <p className="mr-ai-text" key={stage}>{insight}</p>
          </div>
        </div>
      </div>
      <div className="mr-bets">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Bettor</th>
              <th>Bucket</th>
              <th className="num">Amount</th>
              <th className="num">Price Paid</th>
              <th className="num">Units</th>
              <th className="num">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const won = b.bucket === market.winner;
              const cls = closed ? (won ? 'won' : 'lost') : undefined;
              const key = `${b.t}-${b.name}`;
              return (
                <tr
                  key={key}
                  ref={(el) => {
                    if (el) rowEls.current.set(key, el);
                    else rowEls.current.delete(key);
                  }}
                  className={cls}
                  style={closed && won ? { background: bucketRgba(b.bucket, 0.08) } : undefined}
                >
                  <td>{b.time}</td>
                  <td>{b.name}</td>
                  <td style={{ color: bucketRgba(b.bucket, closed && !won ? 0.5 : 0.95), fontWeight: 600 }}>
                    {BUCKET_NAMES[b.bucket]}
                    {closed && won ? (
                      <span className="mr-won-tag" style={{ color: BUCKET_COLORS[b.bucket], borderColor: bucketRgba(b.bucket, 0.5) }}>
                        WINNER
                      </span>
                    ) : null}
                  </td>
                  <td className="num">${b.amount}</td>
                  <td className="num">{fmtMoney(b.price)}</td>
                  <td className="num">{b.units.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                  <td className="num">
                    {!closed ? (
                      <span className="mr-outcome-pending">—</span>
                    ) : won ? (
                      <span style={{ color: BUCKET_COLORS[b.bucket], fontWeight: 600 }}>+{fmtMoney(payout(b))}</span>
                    ) : (
                      <span className="mr-outcome-loss">-{fmtMoney(b.amount)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr className="empty">
                <td colSpan={7}>Bets appear here as the market replays — all buckets open at $0.20</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {closed && (
        <div className="mr-bets-note">
          Bounty ${market.bounty} − 2.75% protocol fee = {fmtMoney(distributable)} distributed to{' '}
          {BUCKET_NAMES[market.winner]} holders by unit share
        </div>
      )}
    </div>
  );
}
