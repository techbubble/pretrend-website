// Shared OLS helpers. x is the sample index (0..n-1), y the price.
export function olsFit(ys) {
  const n = ys.length;
  const xbar = (n - 1) / 2;
  const ybar = ys.reduce((s, y) => s + y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let sst = 0;
  ys.forEach((y, x) => {
    sxx += (x - xbar) ** 2;
    sxy += (x - xbar) * (y - ybar);
    sst += (y - ybar) ** 2;
  });
  const b = sxy / sxx;
  const a = ybar - b * xbar;
  const sse = ys.reduce((s, y, x) => s + (y - (a + b * x)) ** 2, 0);
  return { n, xbar, ybar, sxx, b, a, sse, sst, r2: 1 - sse / sst, trendPct: ((b * (n - 1)) / a) * 100 };
}

// A candidate line with slope b, constrained through the mean point (x̄, ȳ) —
// the same constraint the true OLS line satisfies.
export function lineWithSlope(ys, b) {
  const n = ys.length;
  const xbar = (n - 1) / 2;
  const ybar = ys.reduce((s, y) => s + y, 0) / n;
  const a = ybar - b * xbar;
  const sse = ys.reduce((s, y, x) => s + (y - (a + b * x)) ** 2, 0);
  return { a, sse, trendPct: ((b * (n - 1)) / a) * 100 };
}

export function fmtPct(v, decimals = 3) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`;
}
