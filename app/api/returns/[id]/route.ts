import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getReturnTrip, bookReturnTrip, setReturnTripStatus } from '@/lib/server/returns-repo';

export const runtime = 'nodejs';

type Action = 'BOOK' | 'CANCEL';

// Act on a return trip:
//   BOOK   — by a client (OPEN → BOOKED)
//   CANCEL — by the owning carrier (→ CANCELLED)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as Action;
  if (!['BOOK', 'CANCEL'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  const trip = getReturnTrip(params.id);
  if (!trip) return NextResponse.json({ error: 'Retour introuvable' }, { status: 404 });

  if (action === 'CANCEL') {
    if (user.role !== 'CARRIER' || user.id !== trip.carrierId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    return NextResponse.json({ ok: true, trip: setReturnTripStatus(params.id, 'CANCELLED') });
  }

  // BOOK — clients only.
  if (user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Seuls les chargeurs peuvent réserver un retour' }, { status: 403 });
  }
  const result = bookReturnTrip(params.id);
  if (!result.ok) {
    const status = result.reason === 'NOT_FOUND' ? 404 : 409;
    const error = result.reason === 'NOT_FOUND' ? 'Retour introuvable' : "Ce retour n'est plus disponible";
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ ok: true, trip: result.trip });
}
