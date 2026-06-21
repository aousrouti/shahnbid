// Notify a user through both channels: in-app feed + email (best-effort).
// Centralizes the "add notification + email the recipient" pattern so events
// don't each repeat the lookup/send.
import { addUserNotification, type NotifType } from './user-store';
import { getAccountById } from '@/lib/demo-data/accounts';
import { sendEmail } from '@/lib/email';
import { sendWhatsApp } from '@/lib/whatsapp';

export async function notifyUser(
  userId: string,
  n: { type: NotifType; title: string; body: string },
  createdAt: string,
): Promise<void> {
  await addUserNotification(userId, n, createdAt);
  const acct = await getAccountById(userId);
  if (!acct) return;

  // Fan out to email + WhatsApp (both best-effort; they never throw).
  if (acct.email) {
    await sendEmail({
      to: acct.email,
      subject: `ShahnBid — ${n.title}`,
      text: `Bonjour ${acct.fullName},\n\n${n.body}\n\n— L'équipe ShahnBid`,
    });
  }
  if (acct.phone) {
    await sendWhatsApp({ to: acct.phone, text: `*ShahnBid — ${n.title}*\n\n${n.body}` });
  }
}
