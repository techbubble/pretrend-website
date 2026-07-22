'use client';

import { useMemo, useState } from 'react';
import { marketReplays } from '../../examples/_components/data/market-replays';
import { olsFit, lineWithSlope, fmtPct } from './ols-math';

// Chart geometry
const PX0 = 60;
const PX1 = 690;
const PY0 = 25;
const PY1 = 250;
const FONT = "'Titillium Web',sans-serif";

const B_MIN = -30;
const B_MAX = 15;

export function OlsPlayground() {
  const market = marketReplays.find((m) => m.id === 'jun03-1930');
  const ys = market.market;
  const fit = useMemo(() => olsFit(ys), [ys]);
  const [b, setB] = useState(0);

  const n = ys.length;
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const pad = (hi - lo) * 0.12;
  const yLo = lo - pad;
  const yHi = hi + pad;
  const px = (x) => PX0 + ((PX1 - PX0) * x) / (n - 1);
  const py = (v) => PY0 + ((yHi - v) / (yHi - yLo)) * (PY1 - PY0);

  const user = lineWithSlope(ys, b);
  const snapped = Math.abs(b - fit.b) < 0.05;

  // SSE parabola across the slider range
  const samples = 80;
  const sseMax = Math.max(lineWithSlope(ys, B_MIN).sse, lineWithSlope(ys, B_MAX).sse);
  const gx = (bv) => PX0 + ((PX1 - PX0) * (bv - B_MIN)) / (B_MAX - B_MIN);
  const gy = (sse) => 12 + ((sse - fit.sse) / (sseMax - fit.sse)) * 58;
  const parabola = Array.from({ length: samples + 1 }, (_, i) => {
    const bv = B_MIN + ((B_MAX - B_MIN) * i) / samples;
    return `${gx(bv).toFixed(1)},${gy(lineWithSlope(ys, bv).sse).toFixed(1)}`;
  }).join(' ');

  const fmtSse = (v) => Math.round(v).toLocaleString('en-US');

  return (
    <div>
      <svg viewBox="0 0 720 285" role="img" aria-label="Interactive least-squares fit on the June 3 market data" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <clipPath id="ols-plot">
            <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} />
          </clipPath>
        </defs>
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        {/* residuals from each point to the candidate line */}
        <g clipPath="url(#ols-plot)">
          {ys.map((v, x) => (
            <line
              key={`r${x}`}
              x1={px(x)}
              y1={py(v)}
              x2={px(x)}
              y2={py(user.a + b * x)}
              stroke="rgba(248,113,113,0.45)"
              strokeWidth="1.5"
            />
          ))}
          <line
            x1={px(0)}
            y1={py(user.a)}
            x2={px(n - 1)}
            y2={py(user.a + b * (n - 1))}
            stroke="#2f8fd6"
            strokeWidth="2.5"
          />
        </g>
        {ys.map((v, x) => (
          <circle key={`p${x}`} cx={px(x)} cy={py(v)} r="3" fill="#63a83a" />
        ))}
        {/* the mean point every candidate line pivots through */}
        <circle cx={px(fit.xbar)} cy={py(fit.ybar)} r="4.5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
        <text x={px(fit.xbar) + 10} y={py(fit.ybar) - 8} fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily={FONT}>
          mean point (x&#772;, y&#772;)
        </text>
        <text x={PX0} y={272} fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily={FONT}>
          0 min
        </text>
        <text x={PX1} y={272} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily={FONT}>
          30 min
        </text>
        <text x={(PX0 + PX1) / 2} y={272} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily={FONT}>
          June 3, 2026 market &middot; 30 one-minute BTC closes
        </text>
      </svg>

      <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap mt-2">
        <input
          type="range"
          className="form-range flex-grow-1"
          style={{ minWidth: '200px', maxWidth: '480px' }}
          min={B_MIN}
          max={B_MAX}
          step={0.05}
          value={b}
          onChange={(e) => setB(parseFloat(e.target.value))}
          aria-label="Candidate slope in dollars per minute"
        />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setB(fit.b)}>
          Solve with OLS
        </button>
      </div>

      {/* the residual cost of every slope: a parabola with one minimum */}
      <svg viewBox="0 0 720 90" role="img" aria-label="Sum of squared residuals as a function of slope" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <polyline points={parabola} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <circle cx={gx(fit.b)} cy={gy(fit.sse)} r="4" fill="#63a83a" />
        <circle cx={gx(b)} cy={gy(user.sse)} r="4.5" fill="#2f8fd6" stroke="#0a0f0a" strokeWidth="1.5" />
        <text x={gx(fit.b)} y={gy(fit.sse) + 16} textAnchor="middle" fill="#63a83a" fontSize="11" fontFamily={FONT}>
          minimum
        </text>
        <text x={PX0} y={16} fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily={FONT}>
          residual cost SSE(slope)
        </text>
      </svg>

      <div className="mr-stats">
        <div className="mr-stat">
          <div className="mr-stat-label">Your line</div>
          <div className="mr-stat-value" style={{ color: '#2f8fd6' }}>
            {fmtPct(user.trendPct)} &middot; SSE {fmtSse(user.sse)}
          </div>
        </div>
        <div className="mr-stat">
          <div className="mr-stat-label">OLS solution</div>
          <div className="mr-stat-value" style={{ color: '#63a83a' }}>
            {fmtPct(fit.trendPct)} &middot; SSE {fmtSse(fit.sse)}
          </div>
        </div>
        <div className="mr-stat">
          <div className="mr-stat-label">Verdict</div>
          <div className="mr-stat-value">
            {snapped ? 'You found the minimum' : `${fmtSse(user.sse - fit.sse)} above the minimum`}
          </div>
        </div>
      </div>
    </div>
  );
}
