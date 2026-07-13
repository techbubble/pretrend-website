'use client';

import { useState } from 'react';
import { marketReplays, BUCKET_NAMES } from './data/market-replays';
import { BUCKET_COLORS, bucketRgba } from './bucket-meta';
import { MarketReplay } from './market-replay';
import { BetPanel } from './bet-panel';

function fmtPct(v) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(3)}%`;
}

function fmtPrice(v) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MarketTabs() {
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const m = marketReplays[active];

  const stats = [
    ['Window', `${m.fullDateLabel} · ${m.windowLabel}`],
    ['Open / close', `${fmtPrice(m.market[0])} / ${fmtPrice(m.market[m.market.length - 1])}`],
    ['Trend at 15 min', `${fmtPct(m.trendHalf)} (${BUCKET_NAMES[m.interim]})`],
    ['Final trend', fmtPct(m.trendFull)],
    ['Winner', BUCKET_NAMES[m.winner], BUCKET_COLORS[m.winner]],
  ];

  return (
    <div>
      <div className="mr-tabs" role="tablist" aria-label="Market replays">
        {marketReplays.map((market, i) => (
          <button
            key={market.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`mr-tab${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            {market.dateLabel}
            <span className="mr-tab-bucket" style={{ color: bucketRgba(market.winner, i === active ? 1 : 0.75) }}>
              {BUCKET_NAMES[market.winner]}
            </span>
          </button>
        ))}
      </div>
      {/* plays once and holds the end state; key remounts SVG + panel together to restart in sync.
          Order inside the card: bucket price tiles, chart, bet table. */}
      <div className="card-dark wp-figure mr-once position-relative p-3 p-md-4" key={`${m.id}-${run}`}>
        <BetPanel market={m} onReplay={() => setRun((r) => r + 1)}>
          <MarketReplay market={m} />
        </BetPanel>
      </div>
      <div className="mr-stats">
        {stats.map(([label, value, color]) => (
          <div key={label} className="mr-stat">
            <div className="mr-stat-label">{label}</div>
            <div className="mr-stat-value" style={color ? { color } : undefined}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
