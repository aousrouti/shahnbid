// Return-trip data-access layer, backed by SQL Server via Prisma.
import { prisma } from '@/lib/prisma';
import type { ReturnTrip, PostReturnTripPayload, AvailabilityStatus } from '@/lib/types';
import type { ReturnTrip as ReturnTripRow, Profile } from '@prisma/client';

function mapTrip(t: ReturnTripRow & { carrier: Profile }): ReturnTrip {
  return {
    id: t.id,
    carrierId: t.carrierId,
    carrierName: t.carrier.companyName ?? t.carrier.fullName,
    carrierCity: t.carrier.city ?? '',
    originCity: t.originCity,
    destCity: t.destCity,
    availableDate: t.availableDate.toISOString(),
    capacityKg: t.capacityKg,
    vehicleType: t.vehicleType,
    listedPriceMAD: t.listedPriceMAD,
    notes: t.notes ?? undefined,
    status: t.status as AvailabilityStatus,
  };
}

export interface ReturnFilter {
  status?: AvailabilityStatus;
  originCity?: string;
  destCity?: string;
  carrierId?: string;
}

export async function listReturnTrips(filter: ReturnFilter = {}): Promise<ReturnTrip[]> {
  const rows = await prisma.returnTrip.findMany({
    where: {
      status: filter.status,
      originCity: filter.originCity,
      destCity: filter.destCity,
      carrierId: filter.carrierId,
    },
    include: { carrier: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapTrip);
}

export async function getReturnTrip(id: string): Promise<ReturnTrip | null> {
  const t = await prisma.returnTrip.findUnique({ where: { id }, include: { carrier: true } });
  return t ? mapTrip(t) : null;
}

export interface CreateReturnTripInput extends PostReturnTripPayload {
  carrierId: string;
}

export async function createReturnTrip(input: CreateReturnTripInput, id: string): Promise<ReturnTrip> {
  const t = await prisma.returnTrip.create({
    data: {
      id,
      carrierId: input.carrierId,
      originCity: input.originCity,
      destCity: input.destCity,
      availableDate: new Date(input.availableDate),
      capacityKg: input.capacityKg,
      vehicleType: input.vehicleType,
      listedPriceMAD: input.listedPriceMAD,
      notes: input.notes,
      status: 'OPEN',
    },
    include: { carrier: true },
  });
  return mapTrip(t);
}

export type BookResult =
  | { ok: true; trip: ReturnTrip }
  | { ok: false; reason: 'NOT_FOUND' | 'NOT_OPEN' };

/** A client books an OPEN return trip → BOOKED. */
export async function bookReturnTrip(id: string): Promise<BookResult> {
  const t = await prisma.returnTrip.findUnique({ where: { id } });
  if (!t) return { ok: false, reason: 'NOT_FOUND' };
  if (t.status !== 'OPEN') return { ok: false, reason: 'NOT_OPEN' };
  const updated = await prisma.returnTrip.update({ where: { id }, data: { status: 'BOOKED' }, include: { carrier: true } });
  return { ok: true, trip: mapTrip(updated) };
}

/** The owning carrier cancels (withdraws) their return trip. */
export async function setReturnTripStatus(id: string, status: AvailabilityStatus): Promise<ReturnTrip | null> {
  const t = await prisma.returnTrip.update({ where: { id }, data: { status }, include: { carrier: true } }).catch(() => null);
  return t ? mapTrip(t) : null;
}
