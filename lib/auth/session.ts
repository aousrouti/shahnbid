// Edge-safe session token (HMAC-signed). Used by middleware (Edge) and the
// auth route handlers (Node). No next/headers or Node-only APIs here.
import type { UserRole } from '@/lib/types';

export const SESSION_COOKIE = 'shahnbid_session';

const enc = new TextEncoder();

function secret(): string {
  return process.env.SESSION_SECRET || 'shahnbid-dev-secret-change-me';
}

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s: string): string {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmacHex(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface SessionPayload {
  id: string;
  role: UserRole;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  const body = b64url(`${payload.id}:${payload.role}`);
  const sig = await hmacHex(body);
  return `${body}.${sig}`;
}

export async function verifyToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  if ((await hmacHex(body)) !== sig) return null;
  const [id, role] = b64urlDecode(body).split(':');
  if (!id || !role) return null;
  return { id, role: role as UserRole };
}

export function dashboardFor(role: UserRole): string {
  switch (role) {
    case 'CLIENT': return '/client/dashboard';
    case 'CARRIER': return '/carrier/dashboard';
    case 'ADMIN': return '/admin/dashboard';
    default: return '/';
  }
}
