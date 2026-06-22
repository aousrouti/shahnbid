import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getJobDetail, getJobOwner, cancelJob } from '@/lib/server/jobs-repo';

export const runtime = 'nodejs';

// Job detail (with bids). Carriers see the job; the owning client and admin see everything.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const job = await getJobDetail(params.id);
  if (!job) return NextResponse.json({ error: 'Expédition introuvable' }, { status: 404 });

  return NextResponse.json({ job });
}

// Cancel a job (owning client only, while still PUBLISHED).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (body?.action !== 'CANCEL') {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }
  if (user.role !== 'CLIENT' || (await getJobOwner(params.id)) !== user.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const result = await cancelJob(params.id);
  if (!result.ok) {
    const status = result.reason === 'NOT_FOUND' ? 404 : 409;
    const error = result.reason === 'NOT_FOUND'
      ? 'Expédition introuvable'
      : 'Seule une expédition ouverte peut être annulée';
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ ok: true });
}
