import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { listCarriers } from '@/lib/demo-data/accounts';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  return NextResponse.json({ carriers: await listCarriers() });
}
