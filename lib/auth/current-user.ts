// Server-only helper to read the logged-in account (uses next/headers).
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifyToken } from './session';
import { getAccountById, type PublicAccount } from '@/lib/demo-data/accounts';

export async function getCurrentUser(): Promise<PublicAccount | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token);
  if (!session) return null;
  return getAccountById(session.id);
}
