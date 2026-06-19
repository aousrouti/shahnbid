import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { listBidsForCarrier } from '@/lib/server/bids-repo';

export const runtime = 'nodejs';

// A carrier's own bids across all jobs.
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== 'CARRIER') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  return NextResponse.json({ bids: listBidsForCarrier(user.id) });
}
