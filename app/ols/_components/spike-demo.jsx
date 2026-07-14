'use client';

import { useState } from 'react';
import { marketReplays, BUCKET_NAMES } from '../../examples/_components/data/market-replays';
import { BUCKET_COLORS } from '../../examples/_components/bucket-meta';
import { olsFit, fmtPct } from './ols-math';

const PX0 = 60;
const PX1 = 690;
const PY0 = 20;
const PY1 = 200;
const FONT = "'Titillium Web',sans-serif";

function bucketOf(t, q) {
  for (let i = 0; i < 4; i += 1) {
    if (t < q[i]) return i;
  }
  return 4;
}

export function SpikeDemo() {
  const market = marketReplays.find((m) => m.id === 'jul07-1700');
  const [spiked, setSpiked] = useState(false);

  const base = market.market;
  const ys = spiked ? [...base.slice(0, -1), base[base.length - 1] * 1.003] : base;
  const q = market.thresholds;

  const fit = olsFit(ys);
  const closeOpen = ((ys[ys.length - 1] - ys[0]) / ys[0]) * 100;
  const coBucket = bucketOf(closeOpen, q);
  const olsBucket = bucketOf(fit.trendPct, q);

  const n = ys.length;
  const withSpikeRoom = [...base, base[base.length - 1] * 1.003];
  const lo = Math.min(...withSpikeRoom);
  const hi = Math.max(...withSpikeRoom);
  const pad = (hi - lo) * 0.1;
  const px = (x) => PX0 + ((PX1 - PX0) * x) / (n - 1);
  const py = (v) => PY0 + ((hi + pad - v) / (hi - lo + 2 * pad)) * (PY1 - PY0);

  const pts = ys.map((v, x) => `${px(x).toFixed(1)},${py(v).toFixed(1)}`).join(' ');

  return (
    <div>
      <svg viewBox="0 0 720 230" role="img" aria-label="Effect of a spoofed final price on close-versus-open versus the OLS trend" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <polyline points={pts} fill="none" stroke="#63a83a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <line
          x1={px(0)}
          y1={py(fit.a)}
          x2={px(n - 1)}
          y2={py(fit.a + fit.b * (n - 1))}
          stroke="#2f8fd6"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        {/* straight line between the only two points a close-vs-open rule sees */}
        <line
          x1={px(0)}
          y1={py(ys[0])}
          x2={px(n - 1)}
          y2={py(ys[n - 1])}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
        <circle cx={px(n - 1)} cy={py(ys[n - 1])} r="5" fill={spiked ? '#ef4444' : '#63a83a'} stroke="#0a0f0a" strokeWidth="1.5" />
        {spiked && (
          <text x={px(n - 1) - 10} y={py(ys[n - 1]) - 10} textAnchor="end" fill="#ef4444" fontSize="12" fontWeight="600" fontFamily={FONT}>
            spoofed final price (+0.3%)
          </text>
        )}
        <text x={px(2)} y={py(fit.a) - 10} fill="#2f8fd6" fontSize="12" fontFamily={FONT}>
          OLS fit (all 30 points)
        </text>
        <text x={(PX0 + PX1) / 2} y={222} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily={FONT}>
          July 7, 2026 market &middot; 30 one-minute BTC closes
        </text>
      </svg>

      <div className="d-flex justify-content-center mt-2 mb-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setSpiked((s) => !s)}>
          {spiked ? 'Remove the fake price' : 'Inject a fake final price (+0.3%)'}
        </button>
      </div>

      <div className="mr-stats">
        <div className="mr-stat">
          <div className="mr-stat-label">Close vs open (2 points)</div>
          <div className="mr-stat-value">
            {fmtPct(closeOpen)} &rarr;{' '}
            <span style={{ color: BUCKET_COLORS[coBucket], fontWeight: 600 }}>{BUCKET_NAMES[coBucket]}</span>
          </div>
        </div>
        <div className="mr-stat">
          <div className="mr-stat-label">OLS trend (30 points)</div>
          <div className="mr-stat-value">
            {fmtPct(fit.trendPct)} &rarr;{' '}
            <span style={{ color: BUCKET_COLORS[olsBucket], fontWeight: 600 }}>{BUCKET_NAMES[olsBucket]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
