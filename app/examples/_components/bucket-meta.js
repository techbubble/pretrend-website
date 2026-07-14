// Bucket identity shared with the home page (see app/page.tsx Five Outcome Buckets).
export const BUCKET_COLORS = ['#ef4444', '#f97316', '#a3a3a3', '#4ade80', '#8b5cf6'];

export const BUCKET_DESCS = [
  'Significant decline',
  'Moderate decline',
  'Minimal change',
  'Moderate growth',
  'Significant growth',
];

export function bucketRgba(bucket, alpha) {
  const hex = BUCKET_COLORS[bucket];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
