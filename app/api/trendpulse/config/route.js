import { gameConfig } from '../_lib/core';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await gameConfig());
}
