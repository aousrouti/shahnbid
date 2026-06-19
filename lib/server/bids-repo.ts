// Bid data-access layer. Backend phase: swap bodies to prisma.bid.* (with the
// accept flow wrapped in prisma.$transaction). Signatures stay identical.
import { db, type StoredBid } from './marketplace-db';
import { setJobAccepted } from './jobs-repo';
import type { BidWithCarrier, BidStatus } from '@/lib/types';

function strip(b: StoredBid): BidWithCarrier {
  const { jobId: _jobId, ...rest } = b;
  return rest;
}

export function listBidsForJob(jobId: string): BidWithCarrier[] {
  return Array.from(db.bids.values())
    .filter((b) => b.jobId === jobId && b.status !== 'WITHDRAWN')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(strip);
}

export function listBidsForCarrier(carrierId: string): Array<BidWithCarrier & { jobId: string }> {
  return Array.from(db.bids.values())
    .filter((b) => b.carrier.id === carrierId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBid(id: string): StoredBid | null {
  return db.bids.get(id) ?? null;
}

/** Has this carrier already bid on this job (active bid)? */
export function carrierHasActiveBid(jobId: string, carrierId: string): boolean {
  return Array.from(db.bids.values()).some(
    (b) => b.jobId === jobId && b.carrier.id === carrierId && b.status === 'PENDING',
  );
}

export interface SubmitBidInput {
  jobId: string;
  priceMAD: number;
  etaDays: number;
  vehicleType: string;
  notes?: string;
  carrier: { id: string; companyName: string; city: string; phone: string };
}

export function submitBid(input: SubmitBidInput, id: string, createdAt: string): BidWithCarrier {
  const bid: StoredBid = {
    id,
    jobId: input.jobId,
    priceMAD: input.priceMAD,
    etaDays: input.etaDays,
    vehicleType: input.vehicleType,
    notes: input.notes,
    status: 'PENDING',
    carrier: input.carrier,
    createdAt,
  };
  db.bids.set(id, bid);
  return strip(bid);
}

export type AcceptResult =
  | { ok: true; bid: BidWithCarrier }
  | { ok: false; reason: 'NOT_FOUND' | 'NOT_PENDING' };

/**
 * Accept a bid: mark it ACCEPTED, reject all other active bids on the same job,
 * and flip the job to ACCEPTED with the agreed price. Atomic in spirit — backend
 * phase wraps this in prisma.$transaction.
 */
export function acceptBid(bidId: string): AcceptResult {
  const bid = db.bids.get(bidId);
  if (!bid) return { ok: false, reason: 'NOT_FOUND' };
  if (bid.status !== 'PENDING') return { ok: false, reason: 'NOT_PENDING' };

  for (const other of Array.from(db.bids.values())) {
    if (other.jobId === bid.jobId && other.id !== bid.id && other.status === 'PENDING') {
      other.status = 'REJECTED';
    }
  }
  bid.status = 'ACCEPTED';
  setJobAccepted(bid.jobId, bid.id, bid.priceMAD);
  return { ok: true, bid: strip(bid) };
}

export function setBidStatus(bidId: string, status: BidStatus): BidWithCarrier | null {
  const bid = db.bids.get(bidId);
  if (!bid) return null;
  bid.status = status;
  return strip(bid);
}
