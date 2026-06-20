import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getBid, acceptBid, setBidStatus } from '@/lib/server/bids-repo';
import { getJobOwner } from '@/lib/server/jobs-repo';

export const runtime = 'nodejs';

type Action = 'ACCEPT' | 'REJECT' | 'WITHDRAW';

// Act on a bid:
//   ACCEPT / REJECT — by the client who owns the job
//   WITHDRAW        — by the carrier who made the bid
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as Action;
  if (!['ACCEPT', 'REJECT', 'WITHDRAW'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  const bid = await getBid(params.id);
  if (!bid) return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });

  if (action === 'WITHDRAW') {
    if (user.role !== 'CARRIER' || user.id !== bid.carrier.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    if (bid.status !== 'PENDING') {
      return NextResponse.json({ error: 'Seule une offre en attente peut être retirée' }, { status: 409 });
    }
    return NextResponse.json({ ok: true, bid: await setBidStatus(params.id, 'WITHDRAWN') });
  }

  // ACCEPT / REJECT — must be the job's owning client.
  const owner = await getJobOwner(bid.jobId);
  if (user.role !== 'CLIENT' || user.id !== owner) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (action === 'REJECT') {
    if (bid.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cette offre a déjà été traitée' }, { status: 409 });
    }
    return NextResponse.json({ ok: true, bid: await setBidStatus(params.id, 'REJECTED') });
  }

  // ACCEPT
  const result = await acceptBid(params.id);
  if (!result.ok) {
    const status = result.reason === 'NOT_FOUND' ? 404 : 409;
    const error = result.reason === 'NOT_FOUND' ? 'Offre introuvable' : 'Cette offre ne peut plus être acceptée';
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ ok: true, bid: result.bid });
}
