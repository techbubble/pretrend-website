// TrendPulse public endpoint (CloudFront in front of the oracle's API and feed).
// Empty string = not yet provisioned; the status page shows an offline state.
export const TRENDPULSE_BASE = 'https://d3ulpbw76ladhl.cloudfront.net';

export const TRENDPULSE_SOURCES = [
  {
    key: 'btcusdt',
    label: 'BTC-USDT',
    name: 'Bitcoin',
    unit: 'usd',
    windowS: 30 * 60,
    windowLabel: '30-min',
    trendMode: 'pct',
    desc: 'Bitcoin spot price against USDT. TrendPulse samples 5-second points from a continuous 1-second exchange stream — the feed behind the Preview’s 30-minute BTC markets.',
    dataCadence: 'every 5 seconds',
    attribution: 'Binance',
  },
  {
    key: 'ethusdt',
    label: 'ETH-USDT',
    name: 'Ethereum',
    unit: 'usd',
    windowS: 30 * 60,
    windowLabel: '30-min',
    trendMode: 'pct',
    desc: 'Ethereum spot price against USDT, sampled identically to the BTC feed at 5-second resolution.',
    dataCadence: 'every 5 seconds',
    attribution: 'Binance',
  },
  {
    key: 'gdelt-tone',
    label: 'GDELT · GLOBAL NEWS TONE',
    name: 'World News Sentiment',
    unit: 'tone',
    windowS: 24 * 3600,
    windowLabel: '24-hour',
    trendMode: 'abs',
    desc: 'The average sentiment of world news: mean document tone across every article GDELT processes globally, in 65 languages, per publication window. Below zero means the world’s news skews negative.',
    dataCadence: 'every 15 minutes',
    attribution: 'GDELT Project',
  },
  {
    key: 'nyc-temp',
    label: 'NYC · TEMPERATURE',
    name: 'New York City Temperature',
    unit: 'celsius',
    windowS: 24 * 3600,
    windowLabel: '24-hour',
    trendMode: 'abs',
    desc: 'Air temperature two meters above ground in Manhattan, from Open-Meteo’s blended weather models. A slow, physical series — the opposite end of the cadence spectrum from crypto.',
    dataCadence: 'every 15 minutes',
    attribution: 'Open-Meteo',
  },
];
