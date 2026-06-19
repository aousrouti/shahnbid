import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { listReturnTrips, createReturnTrip, type ReturnFilter } from '@/lib/server/returns-repo';
import { postReturnTripSchema } from '@/lib/validations';
import { getPricingSettings } from '@/lib/pricing/store';

export const runtime = 'nodejs';

// List return trips.
//   default            → OPEN trips (clients browsing), filterable by origin/dest
//   ?mine=1 (carrier)  → the carrier's own trips, all statuses
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter: ReturnFilter = {};

  if (searchParams.get('mine') && user.role === 'CARRIER') {
    filter.carrierId = user.id;
  } else {
    filter.status = 'OPEN';
    const origin = searchParams.get('origin');
    if (origin) filter.originCity = origin;
    const dest = searchParams.get('dest');
    if (dest) filter.destCity = dest;
  }

  return NextResponse.json({ trips: listReturnTrips(filter) });
}

// Publish a return trip (CARRIER, must be APPROVED).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'CARRIER') {
    return NextResponse.json({ error: 'Seuls les transporteurs peuvent publier un retour' }, { status: 403 });
  }
  if (user.status !== 'APPROVED') {
    return NextResponse.json(
      { error: 'Votre compte doit être approuvé avant de publier un retour' },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = postReturnTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Enforce the admin-set price floor.
  const { minJobPriceMAD } = getPricingSettings();
  if (parsed.data.listedPriceMAD < minJobPriceMAD) {
    return NextResponse.json(
      { error: `Le prix minimum autorisé est de ${minJobPriceMAD} MAD` },
      { status: 400 },
    );
  }

  const trip = createReturnTrip(
    {
      ...parsed.data,
      carrierId: user.id,
      carrierName: user.companyName ?? user.fullName,
      carrierCity: user.city ?? '',
    },
    `rt-${crypto.randomUUID().slice(0, 8)}`,
    new Date().toISOString(),
  );

  return NextResponse.json({ ok: true, trip }, { status: 201 });
}
