import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getJobDetail } from '@/lib/server/jobs-repo';

export const runtime = 'nodejs';

// Job detail (with bids). Carriers see the job; the owning client and admin see everything.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const job = await getJobDetail(params.id);
  if (!job) return NextResponse.json({ error: 'Expédition introuvable' }, { status: 404 });

  return NextResponse.json({ job });
}
