// In-memory marketplace database (UX/scaffolding phase).
// Seeded from the existing mock data so the live demo has content. HMR-safe via
// globalThis. Backend phase: the *-repo.ts functions that read/write these maps
// get reimplemented against PrismaClient — this file goes away.
import { mockJobs, mockJobDetails } from '@/lib/mock-data/jobs';
import { mockBids } from '@/lib/mock-data/bids';
import { mockReturnTrips } from '@/lib/mock-data/returns';
import type { JobDetail, BidWithCarrier, ReturnTrip } from '@/lib/types';

// A stored job is the full detail minus the derived fields (bids/bidCount are
// composed at read time), plus the owning client's account id.
export type StoredJob = Omit<JobDetail, 'bids' | 'bidCount'> & { clientId: string };
export type StoredBid = BidWithCarrier & { jobId: string };
export type StoredReturnTrip = ReturnTrip & { createdAt: string };

interface DB {
  jobs: Map<string, StoredJob>;
  bids: Map<string, StoredBid>;
  returnTrips: Map<string, StoredReturnTrip>;
}

const DEMO_CLIENT_ID = 'client-001'; // the seeded "Chargeur" account owns the demo jobs

function seed(): DB {
  const jobs = new Map<string, StoredJob>();
  const bids = new Map<string, StoredBid>();

  for (const summary of mockJobs) {
    const detail = mockJobDetails[summary.id];
    const { bidCount: _bc, ...summaryRest } = summary;
    const stored: StoredJob = detail
      ? (() => {
          const { bids: _b, bidCount: _c, ...rest } = detail;
          return { ...rest, clientId: DEMO_CLIENT_ID };
        })()
      : {
          ...summaryRest,
          description: `${summary.originCity} → ${summary.destCity}`,
          fragile: summary.cargoType === 'FRAGILE',
          hazmat: summary.cargoType === 'HAZMAT',
          originAddress: summary.originCity,
          destAddress: summary.destCity,
          photoUrls: [],
          client: {
            clientType: 'BUSINESS',
            companyName: 'Imex Maroc SARL',
            fullName: 'Karim Benali',
            phone: '+212 6 12 34 56 78',
          },
          clientId: DEMO_CLIENT_ID,
        };
    jobs.set(stored.id, stored);
  }

  // The seeded bids all belong to job-001 (Casablanca → Marrakech).
  for (const b of mockBids) {
    bids.set(b.id, { ...b, jobId: 'job-001' });
  }

  return { jobs, bids, returnTrips: seedReturnTrips() };
}

function seedReturnTrips(): Map<string, StoredReturnTrip> {
  const returnTrips = new Map<string, StoredReturnTrip>();
  // Stagger seeded createdAt so newest-first ordering is stable without timestamps.
  mockReturnTrips.forEach((t, i) => {
    returnTrips.set(t.id, { ...t, createdAt: `2026-07-01T0${i}:00:00Z` });
  });
  return returnTrips;
}

const g = globalThis as unknown as { __shahnbidMarketplace?: DB };
export const db: DB = g.__shahnbidMarketplace ?? (g.__shahnbidMarketplace = seed());

// HMR resilience: a store cached before a sub-store was added would lack it.
// Backfill so older long-lived dev sessions don't crash on the new field.
if (!db.returnTrips) db.returnTrips = seedReturnTrips();
