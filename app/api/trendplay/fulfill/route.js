import { handleFulfill } from '../_lib/core';

export const maxDuration = 120;

export async function POST(req) {
  try {
    const [status, body] = await handleFulfill(await req.json().catch(() => ({})));
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
