import { stateOf, normAddress } from '../_lib/core';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const address = normAddress(new URL(req.url).searchParams.get('address') || '');
    if (!address) return Response.json({ error: 'bad address' }, { status: 400 });
    return Response.json(await stateOf(address));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
