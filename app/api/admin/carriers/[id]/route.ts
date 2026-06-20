import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getAccountById, setCarrierStatus } from '@/lib/demo-data/accounts';
import type { CarrierStatus } from '@/lib/types';
import { subscriptionsForUser } from '@/lib/push/store';
import { getWebPush } from '@/lib/push/webpush';
import { addCarrierNotification, type CarrierNotifType } from '@/lib/notifications/carrier-store';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

const ALLOWED: CarrierStatus[] = ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'];

interface NotifConfig { type: CarrierNotifType; title: string; body: string }

function buildNotifConfig(newStatus: CarrierStatus, prevStatus?: CarrierStatus): NotifConfig | null {
  if (newStatus === 'APPROVED' && prevStatus && prevStatus !== 'PENDING') {
    return {
      type: 'REACTIVATED',
      title: 'Compte réactivé',
      body: 'Votre compte a été réactivé. Vous pouvez à nouveau soumettre des offres sur ShahnBid.',
    };
  }
  if (newStatus === 'APPROVED') {
    return {
      type: 'APPROVED',
      title: 'Dossier approuvé ✓',
      body: "Félicitations ! Votre dossier a été approuvé. Vous pouvez maintenant consulter les appels d'offres et soumettre vos propositions.",
    };
  }
  if (newStatus === 'REJECTED') {
    return {
      type: 'REJECTED',
      title: 'Dossier refusé',
      body: "Votre dossier n'a pas été approuvé. Contactez support@shahnbid.ma pour plus d'informations.",
    };
  }
  if (newStatus === 'SUSPENDED') {
    return {
      type: 'SUSPENDED',
      title: 'Compte suspendu',
      body: 'Votre compte a été temporairement suspendu. Contactez support@shahnbid.ma pour rétablir votre accès.',
    };
  }
  return null; // PENDING — no notification needed
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentUser();
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const newStatus = body?.status as CarrierStatus;
  if (!ALLOWED.includes(newStatus)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  // Read previous status before mutating.
  const existing = await getAccountById(params.id);
  if (!existing || existing.role !== 'CARRIER') {
    return NextResponse.json({ error: 'Transporteur introuvable' }, { status: 404 });
  }

  const updated = await setCarrierStatus(params.id, newStatus);
  if (!updated) return NextResponse.json({ error: 'Transporteur introuvable' }, { status: 404 });

  // Fire in-app notification + push (best-effort, non-blocking).
  const cfg = buildNotifConfig(newStatus, existing.status);
  if (cfg) {
    const now = new Date().toISOString();
    await addCarrierNotification(params.id, { type: cfg.type, title: cfg.title, body: cfg.body }, now);
    await sendEmail({ to: existing.email, subject: `ShahnBid — ${cfg.title}`, text: `Bonjour ${existing.fullName},\n\n${cfg.body}\n\n— L'équipe ShahnBid` });

    const pushSubs = await subscriptionsForUser(params.id);
    if (pushSubs.length > 0) {
      try {
        const wp = getWebPush();
        const payload = JSON.stringify({
          title: `ShahnBid — ${cfg.title}`,
          body: cfg.body,
          url: '/carrier/dashboard',
          tag: 'shahnbid-status',
        });
        await Promise.allSettled(pushSubs.map((s) => wp.sendNotification(s, payload)));
      } catch {
        // VAPID not configured locally — skip silently.
      }
    }
  }

  return NextResponse.json({ ok: true, carrier: updated });
}
