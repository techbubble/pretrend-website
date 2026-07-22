// Thin client for the game API routes (same origin on Vercel).
const BASE = process.env.NEXT_PUBLIC_GAME_API || '';

async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `game API ${res.status}`);
  return data;
}

export const getGameConfig = () => call('/api/trendpulse/config');
export const getGameState = (address) => call(`/api/trendpulse/state?address=${address}`);
export const postBuy = (address, txHash) => call('/api/trendpulse/buy', { address, txHash });
export const postStart = (address) => call('/api/trendpulse/start', { address });
export const postSubmit = (gameId, b) => call('/api/trendpulse/submit', { gameId, b });
export const getTick = (gameId) => call(`/api/trendpulse/tick?gameId=${gameId}`);
export const getLeaderboard = () => call('/api/trendpulse/leaderboard');
