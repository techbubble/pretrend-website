import { olsFit } from './ols-math';

// Two synthetic series with the same underlying slope (+0.1/min) and different
// noise, generated once offline so server and client render identically.
const LOW_NOISE = [100.05, 100.196, 100.081, 100.357, 100.277, 100.653, 100.578, 100.669, 100.791, 100.819, 101.174, 101.005, 101.253, 101.189, 101.433, 101.6, 101.527, 101.759, 101.64, 102.035, 101.99, 102.117, 102.176, 102.19, 102.553, 102.432, 102.692, 102.568, 102.806, 102.979];
const HIGH_NOISE = [100.421, 100.9, 99.206, 100.779, 99.378, 101.773, 100.42, 100.438, 100.722, 100.227, 102.452, 100.309, 101.644, 100.377, 101.672, 102.333, 100.99, 102.193, 100.47, 103.028, 101.919, 102.238, 102.001, 101.385, 103.675, 101.937, 103.364, 101.6, 102.853, 103.558];

const FONT = "'Titillium Web',sans-serif";

function Panel({ ys, caption }) {
  const fit = olsFit(ys);
  const n = ys.length;
  const lo = Math.min(...HIGH_NOISE, ...LOW_NOISE);
  const hi = Math.max(...HIGH_NOISE, ...LOW_NOISE);
  const pad = (hi - lo) * 0.08;
  const px = (x) => 14 + (322 * x) / (n - 1);
  const py = (v) => 12 + ((hi + pad - v) / (hi - lo + 2 * pad)) * 160;
  return (
    <svg viewBox="0 0 350 210" role="img" aria-label={caption} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {ys.map((v, x) => (
        <circle key={x} cx={px(x)} cy={py(v)} r="2.5" fill="#63a83a" />
      ))}
      <line x1={px(0)} y1={py(fit.a)} x2={px(n - 1)} y2={py(fit.a + fit.b * (n - 1))} stroke="#2f8fd6" strokeWidth="2" strokeDasharray="6 5" />
      <text x={175} y={200} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="13" fontFamily={FONT}>
        {caption}: R&#178; = {fit.r2.toFixed(2)}
      </text>
    </svg>
  );
}

export function RsqCompare() {
  return (
    <div className="row g-3">
      <div className="col-md-6">
        <Panel ys={LOW_NOISE} caption="Quiet series" />
      </div>
      <div className="col-md-6">
        <Panel ys={HIGH_NOISE} caption="Noisy series" />
      </div>
    </div>
  );
}
