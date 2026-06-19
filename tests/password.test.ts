import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing', () => {
  it('does not store the plaintext', () => {
    const hash = hashPassword('Secret123');
    expect(hash).not.toContain('Secret123');
    expect(hash.startsWith('scrypt$')).toBe(true);
  });

  it('verifies a correct password', () => {
    const hash = hashPassword('Transporteur2026');
    expect(verifyPassword('Transporteur2026', hash)).toBe(true);
  });

  it('rejects a wrong password', () => {
    const hash = hashPassword('Transporteur2026');
    expect(verifyPassword('wrong', hash)).toBe(false);
  });

  it('produces a unique salt per hash', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });

  it('rejects malformed stored values', () => {
    expect(verifyPassword('x', '')).toBe(false);
    expect(verifyPassword('x', 'plaintext')).toBe(false);
  });
});
