import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { listJobs, createJob, type JobFilter } from '@/lib/server/jobs-repo';
import { postJobSchema } from '@/lib/validations';
import type { JobStatus } from '@/lib/types';

export const runtime = 'nodejs';

// List jobs. Public-ish (any authenticated user); supports filtering.
// A client passes ?mine=1 to see only their own jobs.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter: JobFilter = {};
  const status = searchParams.get('status');
  if (status) filter.status = status as JobStatus;
  const origin = searchParams.get('origin');
  if (origin) filter.originCity = origin;
  const dest = searchParams.get('dest');
  if (dest) filter.destCity = dest;
  if (searchParams.get('mine') && user.role === 'CLIENT') filter.clientId = user.id;

  return NextResponse.json({ jobs: listJobs(filter) });
}

// Post a new job (CLIENT only).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Seuls les chargeurs peuvent publier une expédition' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = postJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const job = createJob(
    {
      ...parsed.data,
      clientId: user.id,
      client: {
        clientType: user.clientType ?? 'INDIVIDUAL',
        companyName: user.companyName,
        fullName: user.fullName,
        phone: user.phone ?? '',
      },
    },
    `job-${crypto.randomUUID().slice(0, 8)}`,
    new Date().toISOString(),
  );

  return NextResponse.json({ ok: true, job }, { status: 201 });
}
