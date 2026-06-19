// Runtime account store, seeded from accounts.json. Supports in-session
// registration (new accounts persist in memory for the running server).
// Passwords are stored hashed (scrypt); the JSON seed holds plaintext demo
// credentials which are hashed on load.
// Backend phase: replace with the Profile/ClientProfile/CarrierProfile tables.
import seed from './accounts.json';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import type { UserRole, ClientType, CarrierStatus } from '@/lib/types';

export interface DemoAccount {
  id: string;
  role: UserRole;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  clientType?: ClientType;
  companyName?: string;
  ice?: string;
  address?: string;
  country?: string;
  city?: string;
  status?: CarrierStatus;
  licenseNumber?: string;
  insuranceExpiry?: string;
  createdAt?: string;
}

export type PublicAccount = Omit<DemoAccount, 'passwordHash'>;

// Shape used when creating an account: plaintext password in, hashed on store.
type NewAccount = Omit<DemoAccount, 'id' | 'passwordHash'> & { password: string };

// JSON seed carries a plaintext `password`; hash it into `passwordHash` on load.
interface SeedAccount extends Omit<DemoAccount, 'passwordHash'> { password: string }

function seedStore(): Map<string, DemoAccount> {
  return new Map(
    (seed.accounts as SeedAccount[]).map((a) => {
      const { password, ...rest } = a;
      return [a.id, { ...rest, passwordHash: hashPassword(password) }];
    }),
  );
}

// Survive Next dev HMR by stashing the store on globalThis.
const g = globalThis as unknown as { __shahnbidAccounts?: Map<string, DemoAccount> };
const store: Map<string, DemoAccount> = g.__shahnbidAccounts ?? (g.__shahnbidAccounts = seedStore());

function sanitize(a: DemoAccount): PublicAccount {
  const { passwordHash: _ph, ...rest } = a;
  return rest;
}

export function findByCredentials(email: string, password: string): PublicAccount | null {
  const e = email.trim().toLowerCase();
  for (const a of Array.from(store.values())) {
    if (a.email.toLowerCase() === e && verifyPassword(password, a.passwordHash)) return sanitize(a);
  }
  return null;
}

export function getAccountById(id: string): PublicAccount | null {
  const a = store.get(id);
  return a ? sanitize(a) : null;
}

export function emailExists(email: string): boolean {
  const e = email.trim().toLowerCase();
  for (const a of Array.from(store.values())) if (a.email.toLowerCase() === e) return true;
  return false;
}

/** Create a new in-session account (plaintext password is hashed before storing). */
export function addAccount(input: NewAccount): PublicAccount {
  const id = `${input.role.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;
  const { password, ...rest } = input;
  const account: DemoAccount = { ...rest, id, passwordHash: hashPassword(password) };
  store.set(id, account);
  return sanitize(account);
}

/** All carrier accounts, PENDING first, then newest. */
export function listCarriers(): PublicAccount[] {
  const rank: Record<string, number> = { PENDING: 0, APPROVED: 1, SUSPENDED: 2, REJECTED: 3 };
  return Array.from(store.values())
    .filter((a) => a.role === 'CARRIER')
    .sort((a, b) => (rank[a.status ?? 'PENDING'] - rank[b.status ?? 'PENDING'])
      || (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .map(sanitize);
}

/** Update a carrier's approval status. Returns the updated account or null. */
export function setCarrierStatus(id: string, status: CarrierStatus): PublicAccount | null {
  const a = store.get(id);
  if (!a || a.role !== 'CARRIER') return null;
  a.status = status;
  return sanitize(a);
}
