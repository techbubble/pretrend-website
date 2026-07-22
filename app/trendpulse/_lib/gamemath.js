// Pure game math and rules shared by the API routes (server) and the preview
// chart (client). No dependencies.

export const N = 30;
export const LOCK_AT = Math.floor(N * 0.8); // dots shown when the game locks
export const STEP_MS = 2000; // one dot every 2 seconds; 30 dots = 60s game
export const START_POINTS = 600;
export const POINTS_PER_DOT = 20; // burned per displayed dot
export const TOLERANCE = 0.02; // win = slope within 2% of the slider's full range
// Signed quintiles of rolling 30-minute OLS trends (same calibration as the
// Examples page), fixed for the game.
export const THRESHOLDS = [-0.1705, -0.0476, 0.0409, 0.1461];

function gaussian() {
  const u = Math.random() || 1e-12;
  const v = Math.random() || 1e-12;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Random 30-minute market. A raw random walk's noise alone swamps the
// threshold band (its fitted trend has ~0.25% std vs ±0.17% thresholds), so
// left uncorrected almost every game resolves Moon or Crash. Instead: pick
// the answer bucket uniformly, draw a target trend inside it, and shear the
// walk so its OLS trend lands exactly on the target (OLS is linear, and the
// intercept is invariant under a shear through x=0, so b* has a closed form).
export function genSeries() {
  const base = 60000 + Math.random() * 15000;
  const sigma = base * 0.0005;
  const ys = [base];
  for (let i = 1; i < N; i++) ys.push(ys[i - 1] + gaussian() * sigma);

  const edges = [-0.35, ...THRESHOLDS, 0.35];
  const bucket = Math.floor(Math.random() * 5);
  const lo = edges[bucket];
  const hi = edges[bucket + 1];
  const margin = (hi - lo) * 0.08; // keep the answer off the exact boundary
  const target = lo + margin + Math.random() * (hi - lo - 2 * margin);

  const fit0 = olsFit(ys);
  const bStar = ((target / 100) * fit0.a) / (N - 1);
  return ys.map((y, x) => y + (bStar - fit0.b) * x);
}

export function olsFit(ys) {
  const n = ys.length;
  const xbar = (n - 1) / 2;
  const ybar = ys.reduce((s, y) => s + y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  ys.forEach((y, x) => {
    sxx += (x - xbar) ** 2;
    sxy += (x - xbar) * (y - ybar);
  });
  const b = sxy / sxx;
  const a = ybar - b * xbar;
  return { n, xbar, ybar, b, a, trendPct: ((b * (n - 1)) / a) * 100 };
}

// Slope that produces trend t (%) for a line pivoting through the mean point.
export function slopeForTrend(t, n, ybar) {
  const xbar = (n - 1) / 2;
  return ((t / 100) * ybar) / ((n - 1) + (t / 100) * xbar);
}

// Dots visible on the server clock: 1 at start, +1 every STEP_MS, max N.
export function dotCount(startedAt, now) {
  return Math.min(N, Math.floor((now - startedAt) / STEP_MS) + 1);
}

// Points a win is worth after k dots have been displayed.
export function pointsAfter(k) {
  return Math.max(0, START_POINTS - POINTS_PER_DOT * k);
}

// Everything the client needs to render a round of a given series.
export function dealGame(ys) {
  const fit = olsFit(ys);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const pad = (hi - lo) * 0.12;
  const fromData = (2.5 * (hi - lo)) / (N - 1);
  const fromThresholds = Math.max(
    ...THRESHOLDS.map((t) => Math.abs(slopeForTrend(t, N, fit.ybar)))
  );
  const bLimit = Math.max(fromData, 1.4 * fromThresholds, 1.3 * Math.abs(fit.b));
  return { fit, bLimit, yLo: lo - pad, yHi: hi + pad };
}

export function clientGameView(ys, deal, dots) {
  return {
    n: N,
    dots: ys.slice(0, dots),
    xbar: deal.fit.xbar,
    ybar: deal.fit.ybar,
    yLo: deal.yLo,
    yHi: deal.yHi,
    bLimit: deal.bLimit,
    thresholds: THRESHOLDS,
    stepMs: STEP_MS,
    lockAt: LOCK_AT,
    startPoints: START_POINTS,
    pointsPerDot: POINTS_PER_DOT,
  };
}
