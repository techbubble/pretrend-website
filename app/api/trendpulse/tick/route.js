import { handleTick } from '../_lib/core';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const gameId = new URL(req.url).searchParams.get('gameId') || '';
    const [status, body] = await handleTick(gameId);
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
