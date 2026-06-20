// Bid data-access layer, backed by SQL Server via Prisma.
import { prisma } from '@/lib/prisma';
import { getPricingSettings } from '@/lib/pricing/store';
import type { BidWithCarrier, BidStatus } from '@/lib/types';
import type { Bid, Profile } from '@prisma/client';

type BidRow = Bid & { carrier: Profile };

/** Map a Bid row (+ joined carrier Profile) to the API shape. */
export function mapBid(b: BidRow): BidWithCarrier & { jobId: string } {
  return {
    id: b.id,
    jobId: b.jobId,
    priceMAD: b.priceMAD,
    etaDays: b.etaDays,
    vehicleType: b.vehicleType,
    notes: b.notes ?? undefined,
    status: b.status as BidStatus,
    carrier: {
      id: b.carrier.id,
      companyName: b.carrier.companyName ?? b.carrier.fullName,
      city: b.carrier.city ?? '',
      phone: b.carrier.phone ?? '',
    },
    createdAt: b.createdAt.toISOString(),
  };
}

export async function listBidsForJob(jobId: string): Promise<BidWithCarrier[]> {
  const rows = await prisma.bid.findMany({
    where: { jobId, status: { not: 'WITHDRAWN' } },
    include: { carrier: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapBid);
}

export async function listBidsForCarrier(carrierId: string): Promise<Array<BidWithCarrier & { jobId: string }>> {
  const rows = await prisma.bid.findMany({
    where: { carrierId },
    include: { carrier: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapBid);
}

export async function getBid(id: string): Promise<(BidWithCarrier & { jobId: string }) | null> {
  const b = await prisma.bid.findUnique({ where: { id }, include: { carrier: true } });
  return b ? mapBid(b) : null;
}

/** The carrier whose bid was accepted on a job (the assigned carrier), if any. */
export async function getAcceptedCarrierId(jobId: string): Promise<string | null> {
  const b = await prisma.bid.findFirst({ where: { jobId, status: 'ACCEPTED' }, select: { carrierId: true } });
  return b?.carrierId ?? null;
}

/** Does this carrier already have a pending bid on this job? */
export async function carrierHasActiveBid(jobId: string, carrierId: string): Promise<boolean> {
  return (await prisma.bid.count({ where: { jobId, carrierId, status: 'PENDING' } })) > 0;
}

export interface SubmitBidInput {
  jobId: string;
  priceMAD: number;
  etaDays: number;
  vehicleType: string;
  notes?: string;
  carrierId: string;
}

export async function submitBid(input: SubmitBidInput, id: string): Promise<BidWithCarrier> {
  const b = await prisma.bid.create({
    data: {
      id,
      jobId: input.jobId,
      carrierId: input.carrierId,
      priceMAD: input.priceMAD,
      etaDays: input.etaDays,
      vehicleType: input.vehicleType,
      notes: input.notes,
      status: 'PENDING',
    },
    include: { carrier: true },
  });
  return mapBid(b);
}

export type AcceptResult =
  | { ok: true; bid: BidWithCarrier }
  | { ok: false; reason: 'NOT_FOUND' | 'NOT_PENDING' };

/**
 * Accept a bid atomically: mark it ACCEPTED, reject the other pending bids, and
 * flip the job to ACCEPTED with the agreed price + the commission rate snapshot.
 */
export async function acceptBid(bidId: string): Promise<AcceptResult> {
  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid) return { ok: false, reason: 'NOT_FOUND' };
  if (bid.status !== 'PENDING') return { ok: false, reason: 'NOT_PENDING' };

  const rate = (await getPricingSettings()).commissionRate;

  const [, , accepted] = await prisma.$transaction([
    prisma.bid.updateMany({
      where: { jobId: bid.jobId, status: 'PENDING', id: { not: bidId } },
      data: { status: 'REJECTED' },
    }),
    prisma.job.update({
      where: { id: bid.jobId },
      data: { status: 'ACCEPTED', agreedPriceMAD: bid.priceMAD, acceptedBidId: bidId, commissionRateSnap: rate },
    }),
    prisma.bid.update({ where: { id: bidId }, data: { status: 'ACCEPTED' }, include: { carrier: true } }),
  ]);

  return { ok: true, bid: mapBid(accepted) };
}

export async function setBidStatus(bidId: string, status: BidStatus): Promise<BidWithCarrier | null> {
  const b = await prisma.bid.update({ where: { id: bidId }, data: { status }, include: { carrier: true } }).catch(() => null);
  return b ? mapBid(b) : null;
}
