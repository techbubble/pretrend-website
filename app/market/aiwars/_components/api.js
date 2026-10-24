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

export const getGameConfig = () => call('/api/trendplay/config');
export const getGameState = (address) => call(`/api/trendplay/state?address=${address}`);
export const postBuy = (address, txHash) => call('/api/trendplay/buy', { address, txHash });
export const postStart = (address) => call('/api/trendplay/start', { address });
export const postSubmit = (gameId, address, b) => call('/api/trendplay/submit', { gameId, address, b });
export const getTick = (gameId, address) => call(`/api/trendplay/tick?gameId=${gameId}&address=${address}`);
export const getLive = () => call('/api/trendplay/live');
export const getLeaderboard = () => call('/api/trendplay/leaderboard');
export const postDrain = (address) => call('/api/trendplay/drain', { address });
