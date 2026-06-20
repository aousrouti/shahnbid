// Return-trip data-access layer, backed by SQL Server via Prisma.
import { prisma } from '@/lib/prisma';
import { getPricingSettings } from '@/lib/pricing/store';
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
  | { ok: true; trip: ReturnTrip; jobId: string }
  | { ok: false; reason: 'NOT_FOUND' | 'NOT_OPEN' };

/**
 * A client books an OPEN return trip. Marks it BOOKED and creates a tracked
 * shipment (a RETURN_TRIP Job already ACCEPTED, plus the carrier's accepted Bid)
 * so it shows up in both portals and flows through the normal lifecycle.
 */
export async function bookReturnTrip(id: string, clientId: string): Promise<BookResult> {
  const t = await prisma.returnTrip.findUnique({ where: { id } });
  if (!t) return { ok: false, reason: 'NOT_FOUND' };
  if (t.status !== 'OPEN') return { ok: false, reason: 'NOT_OPEN' };

  const rate = (await getPricingSettings()).commissionRate;
  const jobId = `job-rt-${crypto.randomUUID().slice(0, 8)}`;
  const bidId = `bid-rt-${crypto.randomUUID().slice(0, 8)}`;

  const [updated] = await prisma.$transaction([
    prisma.returnTrip.update({ where: { id }, data: { status: 'BOOKED' }, include: { carrier: true } }),
    prisma.job.create({
      data: {
        id: jobId, clientId, source: 'RETURN_TRIP', status: 'ACCEPTED', cargoType: 'GENERAL',
        description: `Réservation retour ${t.originCity} → ${t.destCity}`,
        weightKg: t.capacityKg, fragile: false, hazmat: false,
        originCity: t.originCity, originAddress: t.originCity, destCity: t.destCity, destAddress: t.destCity,
        pickupDateFrom: t.availableDate, deliveryDate: t.availableDate, photoUrls: '[]',
        agreedPriceMAD: t.listedPriceMAD, acceptedBidId: bidId, commissionRateSnap: rate,
      },
    }),
    prisma.bid.create({
      data: {
        id: bidId, jobId, carrierId: t.carrierId, priceMAD: t.listedPriceMAD, etaDays: 1,
        vehicleType: t.vehicleType, status: 'ACCEPTED',
      },
    }),
  ]);

  return { ok: true, trip: mapTrip(updated), jobId };
}

/** The owning carrier cancels (withdraws) their return trip. */
export async function setReturnTripStatus(id: string, status: AvailabilityStatus): Promise<ReturnTrip | null> {
  const t = await prisma.returnTrip.update({ where: { id }, data: { status }, include: { carrier: true } }).catch(() => null);
  return t ? mapTrip(t) : null;
}
