// Runtime account store, seeded from accounts.json. Supports in-session
// registration (new accounts persist in memory for the running server).
// Backend phase: replace with the Profile/ClientProfile/CarrierProfile tables.
import seed from './accounts.json';
import type { UserRole, ClientType, CarrierStatus } from '@/lib/types';

export interface DemoAccount {
  id: string;
  role: UserRole;
  email: string;
  password: string;
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

export type PublicAccount = Omit<DemoAccount, 'password'>;

// Survive Next dev HMR by stashing the store on globalThis.
const g = globalThis as unknown as { __shahnbidAccounts?: Map<string, DemoAccount> };
const store: Map<string, DemoAccount> =
  g.__shahnbidAccounts ??
  (g.__shahnbidAccounts = new Map((seed.accounts as DemoAccount[]).map((a) => [a.id, a])));

function sanitize(a: DemoAccount): PublicAccount {
  const { password: _pw, ...rest } = a;
  return rest;
}

export function findByCredentials(email: string, password: string): PublicAccount | null {
  const e = email.trim().toLowerCase();
  for (const a of Array.from(store.values())) {
    if (a.email.toLowerCase() === e && a.password === password) return sanitize(a);
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

/** Create a new in-session account and return it (without the password). */
export function addAccount(input: Omit<DemoAccount, 'id'>): PublicAccount {
  const id = `${input.role.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;
  const account: DemoAccount = { ...input, id };
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
