// Shared demo password-gate helpers. Uses Web Crypto only, so it works in both
// the Edge middleware and Node route handler. This is a soft gate for demos —
// not real authentication (that arrives with Entra in the backend phase).

export const GATE_COOKIE = 'shahnbid_gate';

/** Opaque cookie token derived from the shared password (never stores the raw password). */
export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`shahnbid:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
