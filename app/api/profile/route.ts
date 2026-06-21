import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { updateProfile } from '@/lib/demo-data/accounts';
import { profileUpdateSchema } from '@/lib/validations';

export const runtime = 'nodejs';

// Update the current user's own profile (email/role/status are not editable here).
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Données invalides', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = await updateProfile(user.id, parsed.data);
  if (!updated) return NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 });
  return NextResponse.json({ ok: true, user: updated });
}
