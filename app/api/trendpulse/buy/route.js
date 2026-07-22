import { handleBuy } from '../_lib/core';

export async function POST(req) {
  try {
    const [status, body] = await handleBuy(await req.json().catch(() => ({})));
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
