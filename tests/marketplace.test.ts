import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createJob, getJobDetail, advanceJobStatus, nextStatus } from '@/lib/server/jobs-repo';
import { submitBid, acceptBid } from '@/lib/server/bids-repo';
import { createReturnTrip, bookReturnTrip } from '@/lib/server/returns-repo';

// DB-backed integration tests. Skip when no database is configured.
const dbDescribe = process.env.DATABASE_URL ? describe : describe.skip;

const sfx = crypto.randomUUID().slice(0, 8);
const CLIENT = `client-${sfx}`;
const CARRIER = `carrier-${sfx}`;
const CARRIER2 = `carrier2-${sfx}`;

function jobInput() {
  return {
    clientId: CLIENT,
    cargoType: 'GENERAL' as const, description: 'integration test cargo here', weightKg: 1000,
    fragile: false, hazmat: false,
    originCity: 'Casablanca', originAddress: 'addr a', destCity: 'Rabat', destAddress: 'addr b',
    pickupDateFrom: '2026-08-01', pickupDateTo: '2026-08-02', deliveryDate: '2026-08-03',
  };
}

dbDescribe('marketplace (SQL Server)', () => {
  beforeAll(async () => {
    await prisma.profile.createMany({
      data: [
        { id: CLIENT, role: 'CLIENT', email: `${CLIENT}@t.test`, passwordHash: 'x', fullName: 'Test Client', clientType: 'BUSINESS', companyName: 'Test SARL', phone: '+212600000000' },
        { id: CARRIER, role: 'CARRIER', email: `${CARRIER}@t.test`, passwordHash: 'x', fullName: 'Test Carrier', companyName: 'Test Transport', city: 'Casablanca', phone: '+212611111111', status: 'APPROVED' },
        { id: CARRIER2, role: 'CARRIER', email: `${CARRIER2}@t.test`, passwordHash: 'x', fullName: 'Test Carrier 2', companyName: 'Test Transport 2', city: 'Rabat', phone: '+212622222222', status: 'APPROVED' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.job.deleteMany({ where: { clientId: CLIENT } }); // cascades its bids
    await prisma.returnTrip.deleteMany({ where: { carrierId: { in: [CARRIER, CARRIER2] } } });
    await prisma.profile.deleteMany({ where: { id: { in: [CLIENT, CARRIER, CARRIER2] } } });
    await prisma.$disconnect();
  });

  it('accepts one bid, rejects the others, and assigns the job', async () => {
    await createJob(jobInput(), `job-acc-${sfx}`);
    const b1 = await submitBid({ jobId: `job-acc-${sfx}`, priceMAD: 3000, etaDays: 2, vehicleType: 'Camion 7.5T', carrierId: CARRIER }, `bid-a1-${sfx}`);
    await submitBid({ jobId: `job-acc-${sfx}`, priceMAD: 3500, etaDays: 1, vehicleType: 'Camion 12T', carrierId: CARRIER2 }, `bid-a2-${sfx}`);

    const res = await acceptBid(b1.id);
    expect(res.ok).toBe(true);

    const job = (await getJobDetail(`job-acc-${sfx}`))!;
    expect(job.status).toBe('ACCEPTED');
    expect(job.agreedPriceMAD).toBe(3000);
    expect(job.acceptedBidId).toBe(`bid-a1-${sfx}`);
    expect(typeof job.commissionRateSnap).toBe('number'); // rate locked at acceptance
    expect(job.bids.find((b) => b.id === `bid-a2-${sfx}`)!.status).toBe('REJECTED');
  });

  it('cannot accept an already-resolved bid', async () => {
    const res = await acceptBid(`bid-a1-${sfx}`);
    expect(res.ok).toBe(false);
  });

  it('advances the lifecycle and captures commission on completion', async () => {
    await createJob(jobInput(), `job-lc-${sfx}`);
    const b = await submitBid({ jobId: `job-lc-${sfx}`, priceMAD: 4000, etaDays: 2, vehicleType: 'Camion 7.5T', carrierId: CARRIER }, `bid-lc-${sfx}`);
    await acceptBid(b.id);

    expect((await advanceJobStatus(`job-lc-${sfx}`, 'PICKED_UP')).ok).toBe(true);
    expect((await advanceJobStatus(`job-lc-${sfx}`, 'IN_TRANSIT')).ok).toBe(true);
    expect((await advanceJobStatus(`job-lc-${sfx}`, 'DELIVERED')).ok).toBe(true);
    expect((await advanceJobStatus(`job-lc-${sfx}`, 'COMPLETED')).ok).toBe(true);

    const job = (await getJobDetail(`job-lc-${sfx}`))!;
    expect(job.status).toBe('COMPLETED');
    expect(job.commissionCapturedMAD).toBeGreaterThan(0);
  });

  it('rejects an illegal transition (skipping a step)', async () => {
    await createJob(jobInput(), `job-skip-${sfx}`);
    const r = await advanceJobStatus(`job-skip-${sfx}`, 'DELIVERED'); // still PUBLISHED
    expect(r.ok).toBe(false);
  });

  it('books an open return trip and blocks double-booking', async () => {
    await createReturnTrip(
      { carrierId: CARRIER, originCity: 'Rabat', destCity: 'Fès', availableDate: '2026-08-10', capacityKg: 5000, vehicleType: 'Camion 7.5T', listedPriceMAD: 2500 },
      `rt-${sfx}`,
    );
    const first = await bookReturnTrip(`rt-${sfx}`, CLIENT);
    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(first.trip.status).toBe('BOOKED');
      // Booking creates a tracked RETURN_TRIP shipment for the client.
      const job = await getJobDetail(first.jobId);
      expect(job?.source).toBe('RETURN_TRIP');
      expect(job?.status).toBe('ACCEPTED');
    }

    const second = await bookReturnTrip(`rt-${sfx}`, CLIENT);
    expect(second.ok).toBe(false);
  });
});

describe('job lifecycle (pure)', () => {
  it('exposes the legal next status', () => {
    expect(nextStatus('ACCEPTED')).toBe('PICKED_UP');
    expect(nextStatus('DELIVERED')).toBe('COMPLETED');
    expect(nextStatus('COMPLETED')).toBe(null);
  });
});
