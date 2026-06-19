// Job data-access layer. The API routes call these functions; the implementation
// currently reads/writes the in-memory db. Backend phase: swap bodies to
// prisma.job.* — signatures stay identical.
import { db, type StoredJob } from './marketplace-db';
import type { JobSummary, JobDetail, JobStatus, PostJobPayload, ClientType } from '@/lib/types';

function bidCountFor(jobId: string): number {
  let n = 0;
  for (const b of Array.from(db.bids.values())) {
    if (b.jobId === jobId && b.status !== 'WITHDRAWN') n++;
  }
  return n;
}

function toSummary(j: StoredJob): JobSummary {
  return {
    id: j.id,
    source: j.source,
    status: j.status,
    cargoType: j.cargoType,
    weightKg: j.weightKg,
    originCity: j.originCity,
    destCity: j.destCity,
    pickupDateFrom: j.pickupDateFrom,
    deliveryDate: j.deliveryDate,
    bidCount: bidCountFor(j.id),
    agreedPriceMAD: j.agreedPriceMAD,
    createdAt: j.createdAt,
  };
}

export interface JobFilter {
  status?: JobStatus;
  originCity?: string;
  destCity?: string;
  clientId?: string;
}

export function listJobs(filter: JobFilter = {}): JobSummary[] {
  return Array.from(db.jobs.values())
    .filter((j) => {
      if (filter.status && j.status !== filter.status) return false;
      if (filter.originCity && j.originCity !== filter.originCity) return false;
      if (filter.destCity && j.destCity !== filter.destCity) return false;
      if (filter.clientId && j.clientId !== filter.clientId) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toSummary);
}

/** Full job detail, with its bids composed in (newest first). */
export function getJobDetail(id: string): JobDetail | null {
  const j = db.jobs.get(id);
  if (!j) return null;
  const bids = Array.from(db.bids.values())
    .filter((b) => b.jobId === id && b.status !== 'WITHDRAWN')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ jobId: _jobId, ...rest }) => rest);
  return { ...j, bidCount: bids.length, bids, acceptedBidId: j.acceptedBidId };
}

/** Who owns a job (for accept/reject authorization). */
export function getJobOwner(id: string): string | null {
  return db.jobs.get(id)?.clientId ?? null;
}

export interface CreateJobInput extends PostJobPayload {
  clientId: string;
  client: { clientType: ClientType; companyName?: string; fullName: string; phone: string };
}

export function createJob(input: CreateJobInput, id: string, createdAt: string): JobSummary {
  const job: StoredJob = {
    id,
    clientId: input.clientId,
    source: 'CLIENT_POSTED',
    status: 'PUBLISHED',
    cargoType: input.cargoType,
    weightKg: input.weightKg,
    originCity: input.originCity,
    originAddress: input.originAddress,
    destCity: input.destCity,
    destAddress: input.destAddress,
    pickupDateFrom: input.pickupDateFrom,
    deliveryDate: input.deliveryDate,
    description: input.description,
    fragile: input.fragile,
    hazmat: input.hazmat,
    notes: input.notes,
    photoUrls: [],
    client: input.client,
    createdAt,
  };
  db.jobs.set(id, job);
  return toSummary(job);
}

/** Internal: set status (+ optional agreed price / accepted bid) during accept. */
export function setJobAccepted(jobId: string, acceptedBidId: string, agreedPriceMAD: number): void {
  const j = db.jobs.get(jobId);
  if (!j) return;
  j.status = 'ACCEPTED';
  j.acceptedBidId = acceptedBidId;
  j.agreedPriceMAD = agreedPriceMAD;
}
