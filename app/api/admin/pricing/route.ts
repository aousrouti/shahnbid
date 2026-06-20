import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPricingSettings, updatePricingSettings } from '@/lib/pricing/store';
import { pricingSettingsSchema } from '@/lib/validations';

export const runtime = 'nodejs';

// Read current pricing settings (any admin).
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  return NextResponse.json({ settings: await getPricingSettings() });
}

// Update pricing settings (admin only).
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pricingSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = await updatePricingSettings(parsed.data, user.email);
  return NextResponse.json({ ok: true, settings: updated });
}
