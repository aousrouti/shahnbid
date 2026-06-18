// Loader + lookups over the demo accounts JSON.
import data from './accounts.json';
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
  city?: string;
  status?: CarrierStatus;
}

export type PublicAccount = Omit<DemoAccount, 'password'>;

const ACCOUNTS = (data.accounts as DemoAccount[]);

function sanitize(a: DemoAccount): PublicAccount {
  const { password: _pw, ...rest } = a;
  return rest;
}

/** Validate an email + password against the demo accounts. Returns the account or null. */
export function findByCredentials(email: string, password: string): PublicAccount | null {
  const match = ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  );
  return match ? sanitize(match) : null;
}

export function getAccountById(id: string): PublicAccount | null {
  const match = ACCOUNTS.find((a) => a.id === id);
  return match ? sanitize(match) : null;
}
