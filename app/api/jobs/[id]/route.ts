import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getJobDetail, getJobOwner, cancelJob, updateJob } from '@/lib/server/jobs-repo';
import { postJobSchema } from '@/lib/validations';

export const runtime = 'nodejs';

// Job detail (with bids). Carriers see the job; the owning client and admin see everything.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const job = await getJobDetail(params.id);
  if (!job) return NextResponse.json({ error: 'Expédition introuvable' }, { status: 404 });

  return NextResponse.json({ job });
}

// Owner-only job management: CANCEL or UPDATE (both while still PUBLISHED).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (user.role !== 'CLIENT' || (await getJobOwner(params.id)) !== user.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (body?.action === 'CANCEL') {
    const result = await cancelJob(params.id);
    if (!result.ok) {
      const status = result.reason === 'NOT_FOUND' ? 404 : 409;
      const error = result.reason === 'NOT_FOUND' ? 'Expédition introuvable' : 'Seule une expédition ouverte peut être annulée';
      return NextResponse.json({ error }, { status });
    }
    return NextResponse.json({ ok: true });
  }

  if (body?.action === 'UPDATE') {
    const parsed = postJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const result = await updateJob(params.id, parsed.data);
    if (!result.ok) {
      const status = result.reason === 'NOT_FOUND' ? 404 : 409;
      const error = result.reason === 'NOT_FOUND' ? 'Expédition introuvable' : 'Seule une expédition ouverte peut être modifiée';
      return NextResponse.json({ error }, { status });
    }
    return NextResponse.json({ ok: true, job: result.job });
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
}
