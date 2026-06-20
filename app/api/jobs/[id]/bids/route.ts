import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getJobDetail, getJobOwner } from '@/lib/server/jobs-repo';
import { listBidsForJob, submitBid, carrierHasActiveBid } from '@/lib/server/bids-repo';
import { submitBidSchema } from '@/lib/validations';
import { getPricingSettings } from '@/lib/pricing/store';
import { addUserNotification } from '@/lib/notifications/user-store';
import { addAdminNotification } from '@/lib/notifications/store';

export const runtime = 'nodejs';

// List bids on a job (the owning client or an admin).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const owner = await getJobOwner(params.id);
  if (owner === null) return NextResponse.json({ error: 'Expédition introuvable' }, { status: 404 });
  if (user.role !== 'ADMIN' && user.id !== owner) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  return NextResponse.json({ bids: await listBidsForJob(params.id) });
}

// Submit a bid on a job (CARRIER, must be APPROVED).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (user?.role !== 'CARRIER') {
    return NextResponse.json({ error: 'Seuls les transporteurs peuvent soumettre une offre' }, { status: 403 });
  }
  if (user.status !== 'APPROVED') {
    return NextResponse.json(
      { error: "Votre compte doit être approuvé avant de pouvoir soumettre une offre" },
      { status: 403 },
    );
  }

  const job = await getJobDetail(params.id);
  if (!job) return NextResponse.json({ error: 'Expédition introuvable' }, { status: 404 });
  if (job.status !== 'PUBLISHED') {
    return NextResponse.json({ error: "Cette expédition n'accepte plus d'offres" }, { status: 409 });
  }
  if (await carrierHasActiveBid(params.id, user.id)) {
    return NextResponse.json({ error: 'Vous avez déjà une offre en cours sur cette expédition' }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = submitBidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Enforce the admin-set price floor (in addition to the schema's static minimum).
  const { minJobPriceMAD } = await getPricingSettings();
  if (parsed.data.priceMAD < minJobPriceMAD) {
    return NextResponse.json(
      { error: `Le prix minimum autorisé est de ${minJobPriceMAD} MAD` },
      { status: 400 },
    );
  }

  const bid = await submitBid(
    {
      jobId: params.id,
      priceMAD: parsed.data.priceMAD,
      etaDays: parsed.data.etaDays,
      vehicleType: parsed.data.vehicleType,
      notes: parsed.data.notes,
      carrierId: user.id,
    },
    `bid-${crypto.randomUUID().slice(0, 8)}`,
  );

  // Notify the owning client + admin of the new bid.
  const now = new Date().toISOString();
  const route = `${job.originCity} → ${job.destCity}`;
  const owner = await getJobOwner(params.id);
  if (owner) {
    await addUserNotification(owner, {
      type: 'NEW_BID',
      title: 'Nouvelle offre reçue',
      body: `${user.companyName ?? user.fullName} a proposé ${bid.priceMAD} MAD pour ${route}.`,
    }, now);
  }
  await addAdminNotification({
    type: 'NEW_BID',
    title: 'Nouvelle offre soumise',
    body: `${user.companyName ?? user.fullName} — ${bid.priceMAD} MAD sur ${route}`,
    link: '/admin/jobs',
  }, now);

  return NextResponse.json({ ok: true, bid }, { status: 201 });
}
