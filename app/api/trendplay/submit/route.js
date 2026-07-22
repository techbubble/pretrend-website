import { handleSubmit } from '../_lib/core';

export async function POST(req) {
  try {
    const [status, body] = await handleSubmit(await req.json().catch(() => ({})));
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
