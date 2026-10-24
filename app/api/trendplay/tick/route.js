import { handleTick } from '../_lib/core';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const q = new URL(req.url).searchParams;
    const [status, body] = await handleTick(q.get('gameId') || '', q.get('address') || '');
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
