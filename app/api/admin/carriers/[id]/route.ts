import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { setCarrierStatus } from '@/lib/demo-data/accounts';
import type { CarrierStatus } from '@/lib/types';

export const runtime = 'nodejs';

const ALLOWED: CarrierStatus[] = ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body?.status as CarrierStatus;
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const updated = setCarrierStatus(params.id, status);
  if (!updated) {
    return NextResponse.json({ error: 'Transporteur introuvable' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, carrier: updated });
}
