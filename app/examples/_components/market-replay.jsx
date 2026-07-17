import { BUCKET_NAMES } from './data/market-replays';
import { BUCKET_COLORS, bucketRgba } from './bucket-meta';

// Geometry mirrors Figure 2 in the whitepaper (Appendix B): lead-in band,
// bucket bands locked at open, feed drawing in fast-forward, betting close and
// trend reveal at 80% (24 min), winner highlight at close. Timeline: wpb-* classes.
const X0 = 60;   // lead-in start
const X1 = 230;  // market open
const X2 = 570;  // market close
const XB = 660;  // band/label right edge
const YT = 50;
const YB = 280;

const FONT = "'Titillium Web',sans-serif";

function fmtPct(v, decimals = 2) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`;
}

function fmtPrice(v) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// timeline fractions shared with bet-panel: market open at 10%, close at 70% of the run
const T_OPEN = 0.1;
const T_CLOSE = 0.7;

export function MarketReplay({ market, now = 1 }) {
  const { lead, market: closes, thresholds, fitFull, fit80, winner, interim } = market;

  // bucket band boundaries as fitted end-of-market prices
  const bandPrices = thresholds.map((q) => fitFull[0] * (1 + q / 100));
  const all = [...lead, ...closes, ...bandPrices, fitFull[1], fit80[1]];
  let lo = Math.min(...all);
  let hi = Math.max(...all);
  const pad = (hi - lo) * 0.1;
  lo -= pad;
  hi += pad;
  const y = (v) => YT + ((hi - v) / (hi - lo)) * (YB - YT);

  const pts = (vals, xa, xb) =>
    vals.map((v, i) => `${(xa + ((xb - xa) * i) / (vals.length - 1)).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const leadPts = pts([...lead, closes[0]], X0, X1);
  const marketPts = pts(closes, X1, X2);
  const xm = X1 + ((X2 - X1) * 24) / (closes.length - 1);

  // bands top-to-bottom: Moon, Bull, Flat, Bear, Crash
  const edges = [YT, y(bandPrices[3]), y(bandPrices[2]), y(bandPrices[1]), y(bandPrices[0]), YB];
  const bands = [4, 3, 2, 1, 0].map((bucket, i) => ({
    bucket,
    top: edges[i],
    bottom: edges[i + 1],
  }));

  // live price marker at the head of the drawing feed line
  const progress = Math.max(0, Math.min(1, (now - T_OPEN) / (T_CLOSE - T_OPEN)));
  const headIdx = Math.round(progress * (closes.length - 1));
  const headX = X1 + ((X2 - X1) * headIdx) / (closes.length - 1);
  const headY = y(closes[headIdx]);
  const priceLeft = headX > 460;

  const captions = [
    ['wpb-cap-a', 'Lead-in: 15 minutes of pre-market BTC price, context only'],
    ['wpb-cap-b', `Market open, ${market.tOpen}: all buckets at 10\u00a2, prices climbing`],
    ['wpb-cap-c', `${market.tReveal}: betting closes at $1.00, trend revealed: ${fmtPct(market.trend80, 3)}, tracking ${BUCKET_NAMES[interim]}`],
    ['wpb-cap-d', `Market close: final trend ${fmtPct(market.trendFull, 3)}, ${BUCKET_NAMES[winner]} wins`],
  ];

  return (
    <svg
      viewBox="0 33 720 337"
      role="img"
      aria-label={`Animated replay of a real 30-minute BTC market from ${market.fullDateLabel}: the ${BUCKET_NAMES[winner]} bucket wins with a final trend of ${fmtPct(market.trendFull, 3)}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <rect x={X0} y={YT} width={X1 - X0} height={YB - YT} fill="rgba(255,255,255,0.04)" />
      <g className="wpb-bands">
        {bands.map(({ bucket, top, bottom }) => (
          <rect
            key={bucket}
            x={X1}
            y={top.toFixed(1)}
            width={XB - X1}
            height={(bottom - top).toFixed(1)}
            className={bucket === winner ? 'wpb-win' : undefined}
            fill={bucket === winner ? undefined : bucketRgba(bucket, 0.05)}
            style={
              bucket === winner
                ? { '--mr-band-fill': bucketRgba(bucket, 0.05), '--mr-win-fill': bucketRgba(bucket, 0.18) }
                : undefined
            }
          />
        ))}
        {bandPrices.map((p, i) => (
          <line key={i} x1={X1} y1={y(p).toFixed(1)} x2={XB} y2={y(p).toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {bandPrices.map((p, i) => (
          <text key={i} x={X1 + 6} y={(y(p) - 4).toFixed(1)} fill="rgba(255,255,255,0.45)" fontSize="11" fontFamily={FONT}>
            {fmtPct(thresholds[i])}
          </text>
        ))}
        {bands.map(({ bucket, top, bottom }) => (
          <text
            key={bucket}
            x={XB - 10}
            y={((top + bottom) / 2 + 4).toFixed(1)}
            textAnchor="end"
            className={bucket === winner ? 'wpb-win-label' : undefined}
            fill={bucket === winner ? undefined : bucketRgba(bucket, 0.85)}
            style={bucket === winner ? { '--mr-win-ink': BUCKET_COLORS[bucket], letterSpacing: '0.06em' } : { letterSpacing: '0.06em' }}
            fontSize="12"
            fontWeight="600"
            fontFamily={FONT}
          >
            {BUCKET_NAMES[bucket].toUpperCase()}
          </text>
        ))}
      </g>
      <line x1={X0} y1={YB} x2={XB} y2={YB} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <line x1={X1} y1={YT} x2={X1} y2={YB} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1={xm} y1={YT} x2={xm} y2={YB} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 4" />
      <line x1={X2} y1={YT} x2={X2} y2={YB} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <polyline points={leadPts} fill="none" stroke="#63a83a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.35" />
      <polyline className="wpb-feed" pathLength="1" points={marketPts} fill="none" stroke="#63a83a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <line className="wpb-half" x1={X1} y1={y(fit80[0]).toFixed(1)} x2={xm} y2={y(fit80[1]).toFixed(1)} stroke="#2f8fd6" strokeWidth="2" strokeDasharray="6 5" />
      <line className="wpb-full" x1={X1} y1={y(fitFull[0]).toFixed(1)} x2={X2} y2={y(fitFull[1]).toFixed(1)} stroke="#2f8fd6" strokeWidth="2" strokeDasharray="6 5" />
      <circle className="wpb-full" cx={X2} cy={y(fitFull[1]).toFixed(1)} r="4" fill="#2f8fd6" stroke="#0a0f0a" strokeWidth="2" />
      {now >= T_OPEN && (
        <g>
          <circle cx={headX.toFixed(1)} cy={headY.toFixed(1)} r="3.5" fill="#63a83a" stroke="#0a0f0a" strokeWidth="1.5" />
          <text
            x={(priceLeft ? headX - 9 : headX + 9).toFixed(1)}
            y={(headY - 8).toFixed(1)}
            textAnchor={priceLeft ? 'end' : 'start'}
            fill="#a3d97a"
            fontSize="13"
            fontWeight="600"
            fontFamily={FONT}
            stroke="#0a0f0a"
            strokeWidth="3"
            paintOrder="stroke"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {fmtPrice(closes[headIdx])}
          </text>
        </g>
      )}
      <text x={(X0 + X1) / 2} y={46} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="12" fontFamily={FONT}>
        Lead-in (15 min)
      </text>
      <text x={X0 + 4} y={Math.min(Math.max(...lead.map(y)) + 20, YB - 8).toFixed(1)} fill="#63a83a" fontSize="12" fontFamily={FONT}>
        BTC price
      </text>
      <text className="wpb-trendlabel" x={X1 + 70} y={Math.min(y(fit80[0]), y(fit80[1])) - 14} fill="#2f8fd6" fontSize="12" fontFamily={FONT}>
        OLS trend
      </text>
      <text x={X1} y={300} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily={FONT}>
        {market.tOpen}
      </text>
      <text x={xm} y={300} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily={FONT}>
        {market.tReveal}
      </text>
      <text x={xm} y={315} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily={FONT}>
        betting closes &middot; trend reveals
      </text>
      <text x={X2} y={300} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily={FONT}>
        {market.tClose}
      </text>
      {captions.map(([cls, text]) => (
        <text key={cls} className={`wpa-cap ${cls}`} x={360} y={350} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="13" fontFamily={FONT}>
          {text}
        </text>
      ))}
    </svg>
  );
}
