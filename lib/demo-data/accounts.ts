// Account store, backed by SQL Server via Prisma (Profile table).
// Passwords are stored hashed (scrypt). Demo accounts are inserted by the seed.
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import type { UserRole, ClientType, CarrierStatus } from '@/lib/types';
import type { Profile } from '@prisma/client';

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
  notifyInApp?: boolean;
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
  acceptedTermsAt?: string;
  createdAt?: string;
}

export interface NotificationPrefs {
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
}

export type PublicAccount = Omit<DemoAccount, 'passwordHash'>;

type NewAccount = Omit<DemoAccount, 'id' | 'passwordHash'> & { password: string };

function toPublic(p: Profile): PublicAccount {
  return {
    id: p.id,
    role: p.role as UserRole,
    email: p.email,
    fullName: p.fullName,
    phone: p.phone ?? undefined,
    clientType: (p.clientType as ClientType) ?? undefined,
    companyName: p.companyName ?? undefined,
    ice: p.ice ?? undefined,
    address: p.address ?? undefined,
    country: p.country ?? undefined,
    city: p.city ?? undefined,
    status: (p.status as CarrierStatus) ?? undefined,
    licenseNumber: p.licenseNumber ?? undefined,
    insuranceExpiry: p.insuranceExpiry ?? undefined,
    notifyInApp: p.notifyInApp,
    notifyEmail: p.notifyEmail,
    notifyWhatsapp: p.notifyWhatsapp,
    acceptedTermsAt: p.acceptedTermsAt ? p.acceptedTermsAt.toISOString() : undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

/** Editable profile fields (self-service). Undefined values are left unchanged. */
export type ProfilePatch = Partial<Pick<DemoAccount,
  'fullName' | 'phone' | 'country' | 'city' | 'companyName' | 'ice' | 'address' | 'licenseNumber' | 'insuranceExpiry'>>;

export async function updateProfile(id: string, patch: ProfilePatch): Promise<PublicAccount | null> {
  const p = await prisma.profile.update({ where: { id }, data: patch }).catch(() => null);
  return p ? toPublic(p) : null;
}

/** Update the current user's notification channel preferences. */
export async function updateNotificationPrefs(id: string, prefs: NotificationPrefs): Promise<PublicAccount | null> {
  const p = await prisma.profile.update({
    where: { id },
    data: { notifyInApp: prefs.notifyInApp, notifyEmail: prefs.notifyEmail, notifyWhatsapp: prefs.notifyWhatsapp },
  }).catch(() => null);
  return p ? toPublic(p) : null;
}

export async function findByCredentials(email: string, password: string): Promise<PublicAccount | null> {
  const p = await prisma.profile.findFirst({ where: { email: email.trim() } });
  if (!p || !verifyPassword(password, p.passwordHash)) return null;
  return toPublic(p);
}

export async function getAccountById(id: string): Promise<PublicAccount | null> {
  const p = await prisma.profile.findUnique({ where: { id } });
  return p ? toPublic(p) : null;
}

export async function emailExists(email: string): Promise<boolean> {
  return (await prisma.profile.count({ where: { email: email.trim() } })) > 0;
}

/** Create an account (plaintext password is hashed before storing). */
export async function addAccount(input: NewAccount): Promise<PublicAccount> {
  const { password, ...rest } = input;
  const id = `${input.role.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;
  const p = await prisma.profile.create({
    data: {
      id,
      role: rest.role,
      email: rest.email.trim(),
      passwordHash: hashPassword(password),
      fullName: rest.fullName,
      phone: rest.phone,
      clientType: rest.clientType,
      companyName: rest.companyName,
      ice: rest.ice,
      address: rest.address,
      country: rest.country,
      city: rest.city,
      status: rest.status,
      licenseNumber: rest.licenseNumber,
      insuranceExpiry: rest.insuranceExpiry,
      acceptedTermsAt: rest.acceptedTermsAt ? new Date(rest.acceptedTermsAt) : null,
    },
  });
  return toPublic(p);
}

/** All carrier accounts, PENDING first, then newest. */
export async function listCarriers(): Promise<PublicAccount[]> {
  const rank: Record<string, number> = { PENDING: 0, APPROVED: 1, SUSPENDED: 2, REJECTED: 3 };
  const rows = await prisma.profile.findMany({ where: { role: 'CARRIER' } });
  return rows
    .sort((a, b) =>
      (rank[a.status ?? 'PENDING'] - rank[b.status ?? 'PENDING']) ||
      b.createdAt.getTime() - a.createdAt.getTime())
    .map(toPublic);
}

/** Update a carrier's approval status. Returns the updated account or null. */
export async function setCarrierStatus(id: string, status: CarrierStatus): Promise<PublicAccount | null> {
  const existing = await prisma.profile.findUnique({ where: { id } });
  if (!existing || existing.role !== 'CARRIER') return null;
  const p = await prisma.profile.update({ where: { id }, data: { status } });
  return toPublic(p);
}
