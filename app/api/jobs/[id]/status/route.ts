import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getJobDetail, getJobOwner, advanceJobStatus } from '@/lib/server/jobs-repo';
import { getAcceptedCarrierId } from '@/lib/server/bids-repo';
import { addCarrierNotification } from '@/lib/notifications/carrier-store';
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

  const job = getJobDetail(params.id);
  if (!job) return NextResponse.json({ error: 'Expédition introuvable' }, { status: 404 });

  // Authorize by who is allowed to make this kind of transition.
  if (CARRIER_TARGETS.includes(target)) {
    if (user.role !== 'CARRIER' || getAcceptedCarrierId(params.id) !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
  } else if (CLIENT_TARGETS.includes(target)) {
    if (user.role !== 'CLIENT' || getJobOwner(params.id) !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const result = advanceJobStatus(params.id, target);
  if (!result.ok) {
    const status = result.reason === 'NOT_FOUND' ? 404 : 409;
    const error = result.reason === 'NOT_FOUND'
      ? 'Expédition introuvable'
      : 'Transition de statut non autorisée';
    return NextResponse.json({ error }, { status });
  }

  // On completion, let the assigned carrier know (and that the job is settled).
  if (target === 'COMPLETED') {
    const carrierId = getAcceptedCarrierId(params.id);
    if (carrierId) {
      addCarrierNotification(carrierId, {
        type: 'JOB_UPDATE',
        title: 'Expédition terminée ✓',
        body: `${job.originCity} → ${job.destCity} a été confirmée livrée par le client. Paiement en cours de traitement.`,
      }, new Date().toISOString());
    }
  }

  return NextResponse.json({ ok: true, job: result.job });
}
