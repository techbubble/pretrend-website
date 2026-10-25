import { handleEligibility } from '../_lib/core';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const [status, body] = await handleEligibility(new URL(req.url).searchParams.get('address') || '');
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
