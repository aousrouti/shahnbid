// Job data-access layer, backed by SQL Server via Prisma.
import { prisma } from '@/lib/prisma';
import { mapBid } from './bids-repo';
import { getPricingSettings, commissionAmount } from '@/lib/pricing/store';
import { getPayments } from '@/lib/payments';
import type {
  JobSummary, JobDetail, JobStatus, JobSource, CargoType, ClientType, PostJobPayload,
} from '@/lib/types';
import type { Job } from '@prisma/client';

function toSummary(j: Job, bidCount: number): JobSummary {
  return {
    id: j.id,
    source: j.source as JobSource,
    status: j.status as JobStatus,
    cargoType: j.cargoType as CargoType,
    weightKg: j.weightKg,
    originCity: j.originCity,
    destCity: j.destCity,
    pickupDateFrom: j.pickupDateFrom.toISOString(),
    deliveryDate: j.deliveryDate.toISOString(),
    bidCount,
    agreedPriceMAD: j.agreedPriceMAD ?? undefined,
    commissionRateSnap: j.commissionRateSnap ?? undefined,
    commissionCapturedMAD: j.commissionCapturedMAD ?? undefined,
    paymentStatus: j.paymentStatus ?? undefined,
    createdAt: j.createdAt.toISOString(),
  };
}

/** Record the payment intent ref + status on a job (set at acceptance/capture). */
export async function setJobPayment(jobId: string, paymentRef: string, paymentStatus: string): Promise<void> {
  await prisma.job.update({ where: { id: jobId }, data: { paymentRef, paymentStatus } });
}

export interface JobFilter {
  status?: JobStatus;
  originCity?: string;
  destCity?: string;
  clientId?: string;
}

export async function listJobs(filter: JobFilter = {}): Promise<JobSummary[]> {
  const rows = await prisma.job.findMany({
    where: {
      status: filter.status,
      originCity: filter.originCity,
      destCity: filter.destCity,
      clientId: filter.clientId,
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { bids: { where: { status: { not: 'WITHDRAWN' } } } } } },
  });
  return rows.map((j) => toSummary(j, j._count.bids));
}

/** Full job detail, with bids and the owning client composed in. */
export async function getJobDetail(id: string): Promise<JobDetail | null> {
  const j = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      bids: { where: { status: { not: 'WITHDRAWN' } }, include: { carrier: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!j) return null;

  return {
    ...toSummary(j, j.bids.length),
    description: j.description,
    fragile: j.fragile,
    hazmat: j.hazmat,
    originAddress: j.originAddress,
    destAddress: j.destAddress,
    pickupDateTo: j.pickupDateTo ? j.pickupDateTo.toISOString() : undefined,
    notes: j.notes ?? undefined,
    photoUrls: JSON.parse(j.photoUrls || '[]') as string[],
    bids: j.bids.map(mapBid),
    acceptedBidId: j.acceptedBidId ?? undefined,
    client: {
      clientType: (j.client.clientType as ClientType) ?? 'INDIVIDUAL',
      companyName: j.client.companyName ?? undefined,
      fullName: j.client.fullName,
      phone: j.client.phone ?? '',
    },
  };
}

export type UpdateResult =
  | { ok: true; job: JobSummary }
  | { ok: false; reason: 'NOT_FOUND' | 'NOT_EDITABLE' };

/** Edit a job's fields — only allowed while still PUBLISHED (no accepted bid). */
export async function updateJob(jobId: string, input: PostJobPayload): Promise<UpdateResult> {
  const j = await prisma.job.findUnique({ where: { id: jobId }, select: { status: true } });
  if (!j) return { ok: false, reason: 'NOT_FOUND' };
  if (j.status !== 'PUBLISHED') return { ok: false, reason: 'NOT_EDITABLE' };
  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      cargoType: input.cargoType,
      description: input.description,
      weightKg: input.weightKg,
      fragile: input.fragile,
      hazmat: input.hazmat,
      originCity: input.originCity,
      originAddress: input.originAddress,
      destCity: input.destCity,
      destAddress: input.destAddress,
      pickupDateFrom: new Date(input.pickupDateFrom),
      pickupDateTo: input.pickupDateTo ? new Date(input.pickupDateTo) : null,
      deliveryDate: new Date(input.deliveryDate),
      notes: input.notes,
      photoUrls: JSON.stringify(input.photoUrls ?? []),
    },
    include: { _count: { select: { bids: { where: { status: { not: 'WITHDRAWN' } } } } } },
  });
  return { ok: true, job: toSummary(updated, updated._count.bids) };
}

export type CancelResult =
  | { ok: true }
  | { ok: false; reason: 'NOT_FOUND' | 'NOT_CANCELLABLE' };

/** Cancel a still-open job (PUBLISHED) and reject its pending bids. */
export async function cancelJob(jobId: string): Promise<CancelResult> {
  const j = await prisma.job.findUnique({ where: { id: jobId }, select: { status: true } });
  if (!j) return { ok: false, reason: 'NOT_FOUND' };
  if (j.status !== 'PUBLISHED') return { ok: false, reason: 'NOT_CANCELLABLE' };
  await prisma.$transaction([
    prisma.bid.updateMany({ where: { jobId, status: 'PENDING' }, data: { status: 'REJECTED' } }),
    prisma.job.update({ where: { id: jobId }, data: { status: 'CANCELLED' } }),
  ]);
  return { ok: true };
}

/** Who owns a job (for accept/reject authorization). */
export async function getJobOwner(id: string): Promise<string | null> {
  const j = await prisma.job.findUnique({ where: { id }, select: { clientId: true } });
  return j?.clientId ?? null;
}

export interface CreateJobInput extends PostJobPayload {
  clientId: string;
}

export async function createJob(input: CreateJobInput, id: string): Promise<JobSummary> {
  const j = await prisma.job.create({
    data: {
      id,
      clientId: input.clientId,
      source: 'CLIENT_POSTED',
      status: 'PUBLISHED',
      cargoType: input.cargoType,
      description: input.description,
      weightKg: input.weightKg,
      fragile: input.fragile,
      hazmat: input.hazmat,
      originCity: input.originCity,
      originAddress: input.originAddress,
      destCity: input.destCity,
      destAddress: input.destAddress,
      pickupDateFrom: new Date(input.pickupDateFrom),
      pickupDateTo: input.pickupDateTo ? new Date(input.pickupDateTo) : null,
      deliveryDate: new Date(input.deliveryDate),
      notes: input.notes,
      photoUrls: JSON.stringify(input.photoUrls ?? []),
    },
  });
  return toSummary(j, 0);
}

// Linear shipment lifecycle. Each status advances to exactly one next status.
const NEXT_STATUS: Partial<Record<JobStatus, JobStatus>> = {
  ACCEPTED:   'PICKED_UP',
  PICKED_UP:  'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
  DELIVERED:  'COMPLETED',
};

/** The status a job in `current` is allowed to move to next (null if terminal). */
export function nextStatus(current: JobStatus): JobStatus | null {
  return NEXT_STATUS[current] ?? null;
}

export type AdvanceResult =
  | { ok: true; job: JobSummary }
  | { ok: false; reason: 'NOT_FOUND' | 'INVALID_TRANSITION' };

/**
 * Advance a job to `target`, which must be the legal next status.
 * On COMPLETED, commission is captured using the rate snapshotted at acceptance.
 */
export async function advanceJobStatus(jobId: string, target: JobStatus): Promise<AdvanceResult> {
  const j = await prisma.job.findUnique({ where: { id: jobId } });
  if (!j) return { ok: false, reason: 'NOT_FOUND' };
  if ((NEXT_STATUS[j.status as JobStatus] ?? null) !== target) return { ok: false, reason: 'INVALID_TRANSITION' };

  let commissionCapturedMAD: number | undefined;
  let paymentStatus: string | undefined;
  if (target === 'COMPLETED') {
    const s = await getPricingSettings();
    const rate = j.commissionRateSnap ?? s.commissionRate;
    commissionCapturedMAD = commissionAmount(j.agreedPriceMAD ?? 0, { ...s, commissionRate: rate });
    // Capture the held payment (best-effort).
    if (j.paymentRef) {
      try {
        paymentStatus = (await getPayments().capture(j.paymentRef)).status;
      } catch (e) {
        console.error('[payments] capture failed:', e);
      }
    }
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: { status: target, commissionCapturedMAD, paymentStatus },
    include: { _count: { select: { bids: { where: { status: { not: 'WITHDRAWN' } } } } } },
  });
  return { ok: true, job: toSummary(updated, updated._count.bids) };
}
