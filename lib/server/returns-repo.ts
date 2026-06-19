// Return-trip data-access layer. Backend phase: swap bodies to prisma.returnTrip.*
// — signatures stay identical.
import { db, type StoredReturnTrip } from './marketplace-db';
import type { ReturnTrip, PostReturnTripPayload, AvailabilityStatus } from '@/lib/types';

function strip(t: StoredReturnTrip): ReturnTrip {
  const { createdAt: _c, ...rest } = t;
  return rest;
}

export interface ReturnFilter {
  status?: AvailabilityStatus;
  originCity?: string;
  destCity?: string;
  carrierId?: string;
}

export function listReturnTrips(filter: ReturnFilter = {}): ReturnTrip[] {
  return Array.from(db.returnTrips.values())
    .filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.originCity && t.originCity !== filter.originCity) return false;
      if (filter.destCity && t.destCity !== filter.destCity) return false;
      if (filter.carrierId && t.carrierId !== filter.carrierId) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(strip);
}

export function getReturnTrip(id: string): StoredReturnTrip | null {
  return db.returnTrips.get(id) ?? null;
}

export interface CreateReturnTripInput extends PostReturnTripPayload {
  carrierId: string;
  carrierName: string;
  carrierCity: string;
}

export function createReturnTrip(input: CreateReturnTripInput, id: string, createdAt: string): ReturnTrip {
  const trip: StoredReturnTrip = {
    id,
    carrierId: input.carrierId,
    carrierName: input.carrierName,
    carrierCity: input.carrierCity,
    originCity: input.originCity,
    destCity: input.destCity,
    availableDate: input.availableDate,
    capacityKg: input.capacityKg,
    vehicleType: input.vehicleType,
    listedPriceMAD: input.listedPriceMAD,
    notes: input.notes,
    status: 'OPEN',
    createdAt,
  };
  db.returnTrips.set(id, trip);
  return strip(trip);
}

export type BookResult =
  | { ok: true; trip: ReturnTrip }
  | { ok: false; reason: 'NOT_FOUND' | 'NOT_OPEN' };

/** A client books an OPEN return trip → BOOKED. */
export function bookReturnTrip(id: string): BookResult {
  const trip = db.returnTrips.get(id);
  if (!trip) return { ok: false, reason: 'NOT_FOUND' };
  if (trip.status !== 'OPEN') return { ok: false, reason: 'NOT_OPEN' };
  trip.status = 'BOOKED';
  return { ok: true, trip: strip(trip) };
}

/** The owning carrier cancels (withdraws) their return trip. */
export function setReturnTripStatus(id: string, status: AvailabilityStatus): ReturnTrip | null {
  const trip = db.returnTrips.get(id);
  if (!trip) return null;
  trip.status = status;
  return strip(trip);
}
