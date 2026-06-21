import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { updateNotificationPrefs } from '@/lib/demo-data/accounts';

export const runtime = 'nodejs';

// Read the current user's notification channel preferences.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  return NextResponse.json({
    notifyInApp: user.notifyInApp ?? true,
    notifyEmail: user.notifyEmail ?? true,
    notifyWhatsapp: user.notifyWhatsapp ?? false,
    phone: user.phone ?? '',
  });
}

// Update them.
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const updated = await updateNotificationPrefs(user.id, {
    notifyInApp: !!body.notifyInApp,
    notifyEmail: !!body.notifyEmail,
    notifyWhatsapp: !!body.notifyWhatsapp,
  });
  if (!updated) return NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 });
  return NextResponse.json({
    ok: true,
    notifyInApp: updated.notifyInApp,
    notifyEmail: updated.notifyEmail,
    notifyWhatsapp: updated.notifyWhatsapp,
  });
}
