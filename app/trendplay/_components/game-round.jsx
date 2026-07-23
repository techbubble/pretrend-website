'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BUCKET_NAMES } from '../../examples/_components/data/market-replays';
import { bucketRgba } from '../../examples/_components/bucket-meta';
import { fmtPct } from '../../ols/_components/ols-math';
import { getTick } from './api';

// Chart geometry
const PX0 = 60;
const PX1 = 600;
const PY0 = 25;
const PY1 = 250;
const BX0 = 632;
const BX1 = 838;
const MIN_BOX = 28;
const FONT = "'Titillium Web',sans-serif";

const CONFETTI_COLORS = ['#63a83a', '#2f8fd6', '#8fd463', '#e8c547', '#ffffff'];

// Slope that produces trend t (%) for a line pivoting through the mean point.
function slopeForTrend(t, n, ybar) {
  const xbar = (n - 1) / 2;
  return ((t / 100) * ybar) / ((n - 1) + (t / 100) * xbar);
}

export function GameRound({ game, result, submitting, onSubmit, onPlayAgain, canReplay, preview, onPlay, canPlay }) {
  const [b, setB] = useState(0);
  const [confetti, setConfetti] = useState(null);
  const [dots, setDots] = useState(game.dots);
  const [locked, setLocked] = useState(false);
  const [pointsNow, setPointsNow] = useState(game.startPoints - game.pointsPerDot * game.dots.length);

  const { n, xbar, ybar, yLo, yHi, bLimit, thresholds, lockAt } = game;
  const submitted = !!result;

  const bRef = useRef(b);
  bRef.current = b;
  const autoSubmitted = useRef(false);

  // Timed reveal: poll the server clock for new dots; auto-submit at the lock.
  useEffect(() => {
    if (preview || submitted || !game.gameId) return undefined;
    const timer = setInterval(async () => {
      try {
        const t = await getTick(game.gameId);
        setDots(t.dots);
        setPointsNow(t.pointsNow);
        if (t.locked) {
          setLocked(true);
          if (!autoSubmitted.current) {
            autoSubmitted.current = true;
            onSubmit(bRef.current);
          }
        }
      } catch (e) {
        // 410 = someone submitted; parent state will catch up
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [game.gameId, preview, submitted, onSubmit]);

  useEffect(() => {
    if (result?.win) {
      setConfetti(
        Array.from({ length: 90 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.4,
          duration: 1.6 + Math.random() * 1.2,
          size: 5 + Math.random() * 6,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          spin: 360 + Math.random() * 540,
          drift: -40 + Math.random() * 80,
        }))
      );
    }
  }, [result]);

  const px = (x) => PX0 + ((PX1 - PX0) * x) / (n - 1);
  const py = (v) => PY0 + ((yHi - v) / (yHi - yLo)) * (PY1 - PY0);

  // User line pivots through the full-series mean point.
  const userA = ybar - b * xbar;
  const userTrend = ((b * (n - 1)) / userA) * 100;

  const bucketOf = (trend) => thresholds.filter((t) => trend >= t).length;
  const aimBucket = bucketOf(userTrend);
  const trueBucket = submitted ? bucketOf(result.fit.trendPct) : -1;
  const delta = submitted ? Math.abs(userTrend - result.fit.trendPct) : 0;

  // Bucket boundaries as endpoint prices, mapped to screen y and spaced apart.
  const bounds = useMemo(() => {
    const raw = thresholds.map((t) => {
      const bt = slopeForTrend(t, n, ybar);
      return py(ybar + (bt * (n - 1)) / 2);
    });
    const clamped = raw.map((v) => Math.min(PY1 - MIN_BOX, Math.max(PY0 + MIN_BOX, v)));
    for (let i = 1; i < clamped.length; i++) {
      clamped[i] = Math.min(clamped[i], clamped[i - 1] - MIN_BOX);
    }
    for (let i = clamped.length - 2; i >= 0; i--) {
      clamped[i] = Math.max(clamped[i], clamped[i + 1] + MIN_BOX);
    }
    return clamped;
  }, [game]);

  // Box vertical extents, index matches BUCKET_NAMES (0 = Crash ... 4 = Moon).
  const boxes = [
    [bounds[0], PY1],
    [bounds[1], bounds[0]],
    [bounds[2], bounds[1]],
    [bounds[3], bounds[2]],
    [PY0, bounds[3]],
  ];

  // Screen-space extrapolation of a line into the target strip.
  const extendY = (a, slope, atX) => {
    const y0 = py(a);
    const y1 = py(a + slope * (n - 1));
    return y0 + ((atX - px(0)) * (y1 - y0)) / (px(n - 1) - px(0));
  };

  // Bucket identity colors follow the examples-page convention; the aimed /
  // winning box lights up in its own bucket color rather than blue/green.
  const boxActive = (i) => (submitted ? i === trueBucket || i === aimBucket : i === aimBucket);
  const boxFill = (i) => bucketRgba(i, boxActive(i) ? 0.3 : 0.08);
  const boxStroke = (i) => bucketRgba(i, boxActive(i) ? 1 : 0.45);
  const boxText = (i) => (boxActive(i) ? '#ffffff' : bucketRgba(i, 0.9));

  const lockFrom = px(lockAt - 1);
  const shownDots = submitted ? result.series : dots;
  const sliderDisabled = submitted || submitting || (locked && !preview);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes ptg-confetti-fall {
          0% { transform: translate(0, -20px) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 340px) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes ptg-dot-in {
          0% { opacity: 0; r: 8; }
          100% { opacity: 1; r: 3; }
        }
      `}</style>

      {!preview && !submitted && (
        <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 mb-1" style={{ fontFamily: FONT, fontSize: '1.1rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>
            Price <span className="text-white">{dots.length}</span> / {n} &middot; lock at {lockAt}
          </span>
          <span>
            <span style={{ color: '#e8c547', fontWeight: 600 }}>{pointsNow}</span>{' '}
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Points</span>
          </span>
        </div>
      )}

      {[
        { withStrip: true, id: 'd', cls: 'd-none d-md-block' },
        { withStrip: false, id: 'm', cls: 'd-md-none' },
      ].map(({ withStrip, id, cls }) => (
        <svg
          key={id}
          className={cls}
          viewBox={withStrip ? '0 0 850 285' : '0 0 620 285'}
          role="img"
          aria-label="Guess the OLS trend and aim at an outcome bucket"
          style={{ width: '100%', height: 'auto' }}
        >
          <defs>
            <clipPath id={`game-plot-${id}`}>
              <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} />
            </clipPath>
          </defs>
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

          {/* the locked runout: last 20% of the window */}
          <rect x={lockFrom} y={PY0} width={PX1 - lockFrom} height={PY1 - PY0} fill="rgba(255,255,255,0.035)" />
          <line x1={lockFrom} y1={PY0} x2={lockFrom} y2={PY1} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 4" />
          {!submitted && (
            <text x={(lockFrom + PX1) / 2} y={PY0 + 24} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="18" fontFamily={FONT}>
              lock
            </text>
          )}

          {/* outcome buckets: side strip on wide screens only */}
          {withStrip && BUCKET_NAMES.map((name, i) => {
            const [top, bottom] = boxes[i];
            return (
              <g key={name}>
                <rect x={BX0} y={top} width={BX1 - BX0} height={bottom - top} rx="6" fill={boxFill(i)} stroke={boxStroke(i)} strokeWidth="1.5" />
                <text
                  x={(BX0 + BX1) / 2}
                  y={(top + bottom) / 2 + 4}
                  textAnchor="middle"
                  fill={boxText(i)}
                  fontSize="19"
                  fontWeight="600"
                  fontFamily={FONT}
                >
                  {name}
                </text>
              </g>
            );
          })}

          {/* candidate line and its projection into the strip */}
          <g clipPath={`url(#game-plot-${id})`}>
            <line x1={px(0)} y1={py(userA)} x2={px(n - 1)} y2={py(userA + b * (n - 1))} stroke="#2f8fd6" strokeWidth="2.5" />
          </g>
          {withStrip && (
            <line
              x1={px(n - 1)}
              y1={py(userA + b * (n - 1))}
              x2={BX0 - 4}
              y2={extendY(userA, b, BX0 - 4)}
              stroke="rgba(47,143,214,0.5)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />
          )}

          {/* the answer, revealed on submit */}
          {submitted && (
            <>
              <g clipPath={`url(#game-plot-${id})`}>
                <line x1={px(0)} y1={py(result.fit.a)} x2={px(n - 1)} y2={py(result.fit.a + result.fit.b * (n - 1))} stroke="#63a83a" strokeWidth="2.5" strokeDasharray="5 6" />
              </g>
              {withStrip && (
                <line
                  x1={px(n - 1)}
                  y1={py(result.fit.a + result.fit.b * (n - 1))}
                  x2={BX0 - 4}
                  y2={extendY(result.fit.a, result.fit.b, BX0 - 4)}
                  stroke="rgba(99,168,58,0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                />
              )}
            </>
          )}

          <g clipPath={`url(#game-plot-${id})`}>
            {shownDots.length > 1 && (
              <polyline
                points={shownDots.map((v, x) => `${px(x).toFixed(1)},${py(v).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="rgba(99,168,58,0.55)"
                strokeWidth="1.5"
              />
            )}
            {shownDots.map((v, x) => (
              <circle
                key={`p${x}`}
                cx={px(x)}
                cy={py(v)}
                r="3"
                fill={x >= lockAt ? '#e8c547' : '#63a83a'}
                style={!preview && !submitted ? { animation: 'ptg-dot-in 0.35s ease-out' } : undefined}
              />
            ))}
          </g>
          <circle cx={px(xbar)} cy={py(ybar)} r="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

          <text x={PX0} y={276} fill="rgba(255,255,255,0.55)" fontSize="20" fontFamily={FONT}>
            0 min
          </text>
          <text x={PX1} y={276} textAnchor="end" fill="rgba(255,255,255,0.55)" fontSize="20" fontFamily={FONT}>
            30 min
          </text>
        </svg>
      ))}

      {/* buckets as a full-width row on small screens */}
      <div className="d-md-none d-flex gap-1 mt-2">
        {BUCKET_NAMES.map((name, i) => (
          <div
            key={name}
            className="flex-fill text-center"
            style={{
              background: boxFill(i),
              border: `1.5px solid ${boxStroke(i)}`,
              borderRadius: '6px',
              padding: '8px 0',
              fontFamily: FONT,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: boxText(i),
            }}
          >
            {name}
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap mt-2">
        <input
          type="range"
          className="form-range ptg-slope-range flex-grow-1"
          style={{ minWidth: '200px', maxWidth: '480px' }}
          min={-bLimit}
          max={bLimit}
          step={bLimit / 200}
          value={b}
          disabled={sliderDisabled}
          onChange={(e) => setB(parseFloat(e.target.value))}
          aria-label="Candidate slope in dollars per minute"
        />
        {submitted ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={onPlayAgain} disabled={!canReplay}>
            Play again &mdash; uses 1 credit
          </button>
        ) : preview ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={onPlay} disabled={!canPlay}>
            Play &mdash; uses 1 credit
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onSubmit(b)} disabled={submitting || locked}>
            {submitting || locked ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </div>

      <div className="text-center mt-3" style={{ fontFamily: FONT, minHeight: '1.6em' }}>
        {submitted ? (
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>
            OLS answer <span style={{ color: '#63a83a' }}>{fmtPct(result.fit.trendPct)}</span> ({BUCKET_NAMES[trueBucket]}) &middot;
            your line <span style={{ color: '#2f8fd6' }}>{fmtPct(userTrend)}</span> ({BUCKET_NAMES[aimBucket]}) &middot;{' '}
            {result.win ? (
              <strong className="text-white">Hit &mdash; +{result.pointsWon} points</strong>
            ) : (
              <span>miss by {fmtPct(delta).replace('+', '')} &mdash; 0 points</span>
            )}
          </span>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
            Your line: <span style={{ color: '#2f8fd6' }}>{fmtPct(userTrend)}</span> &middot; aiming at {BUCKET_NAMES[aimBucket]}
            {preview ? ' · preview — buy credits and play to score' : ''}
          </span>
        )}
      </div>

      {confetti && (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {confetti.map((c) => (
            <span
              key={c.id}
              style={{
                position: 'absolute',
                top: 0,
                left: `${c.left}%`,
                width: `${c.size}px`,
                height: `${c.size * 0.45}px`,
                background: c.color,
                borderRadius: '1px',
                '--drift': `${c.drift}px`,
                '--spin': `${c.spin}deg`,
                animation: `ptg-confetti-fall ${c.duration}s cubic-bezier(0.25,0.6,0.45,1) ${c.delay}s forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
