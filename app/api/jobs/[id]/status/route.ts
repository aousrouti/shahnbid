import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getJobDetail, getJobOwner, advanceJobStatus } from '@/lib/server/jobs-repo';
import { getAcceptedCarrierId } from '@/lib/server/bids-repo';
import { notifyUser } from '@/lib/notifications/notify';
import { JOB_STATUS_LABELS } from '@/lib/constants';
import type { JobStatus } from '@/lib/types';

export const runtime = 'nodejs';

// Carrier-driven transitions vs. the client-driven completion.
const CARRIER_TARGETS: JobStatus[] = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
const CLIENT_TARGETS: JobStatus[] = ['COMPLETED'];

// Advance a job along its shipment lifecycle.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const target = body?.status as JobStatus;

  const job = await getJobDetail(params.id);
  if (!job) return NextResponse.json({ error: 'Expédition introuvable' }, { status: 404 });

  // Authorize by who is allowed to make this kind of transition.
  if (CARRIER_TARGETS.includes(target)) {
    if (user.role !== 'CARRIER' || (await getAcceptedCarrierId(params.id)) !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
  } else if (CLIENT_TARGETS.includes(target)) {
    if (user.role !== 'CLIENT' || (await getJobOwner(params.id)) !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const result = await advanceJobStatus(params.id, target);
  if (!result.ok) {
    const status = result.reason === 'NOT_FOUND' ? 404 : 409;
    const error = result.reason === 'NOT_FOUND'
      ? 'Expédition introuvable'
      : 'Transition de statut non autorisée';
    return NextResponse.json({ error }, { status });
  }

  const now = new Date().toISOString();
  const route = `${job.originCity} → ${job.destCity}`;

  if (target === 'COMPLETED') {
    // Notify the assigned carrier that the job is settled.
    const carrierId = await getAcceptedCarrierId(params.id);
    if (carrierId) {
      await notifyUser(carrierId, {
        type: 'JOB_UPDATE',
        title: 'Expédition terminée ✓',
        body: `${route} a été confirmée livrée par le client. Paiement en cours de traitement.`,
      }, now);
    }
  } else {
    // Carrier advanced the shipment — notify the owning client.
    const clientId = await getJobOwner(params.id);
    if (clientId) {
      await notifyUser(clientId, {
        type: 'STATUS_UPDATE',
        title: `Statut mis à jour : ${JOB_STATUS_LABELS[target]}`,
        body: `Votre expédition ${route} est maintenant « ${JOB_STATUS_LABELS[target]} ».`,
      }, now);
    }
  }

  return NextResponse.json({ ok: true, job: result.job });
}
