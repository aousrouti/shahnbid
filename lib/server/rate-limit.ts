// Lightweight fixed-window rate limiter (in-memory, per server instance).
// Good enough to blunt brute-force on auth routes in single-instance dev/demo.
// Backend phase at scale: move the counter to Redis so it's shared across instances.
const g = globalThis as unknown as { __shahnbidRateLimit?: Map<string, { count: number; reset: number }> };
const store = g.__shahnbidRateLimit ?? (g.__shahnbidRateLimit = new Map());

export interface RateResult {
  ok: boolean;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((entry.reset - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers (Vercel/Next set x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
