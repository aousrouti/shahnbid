// Password hashing for the account store. Uses Node's scrypt (no native deps,
// no extra packages). Runs only in Node route handlers / server components —
// never in Edge middleware. Format: "scrypt$<saltHex>$<hashHex>".
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [scheme, salt, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(plain, salt, KEYLEN);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
