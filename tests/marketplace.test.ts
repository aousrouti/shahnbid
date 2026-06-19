import { describe, it, expect } from 'vitest';
import { createJob, getJobDetail, advanceJobStatus, nextStatus } from '@/lib/server/jobs-repo';
import { submitBid, acceptBid } from '@/lib/server/bids-repo';
import { createReturnTrip, bookReturnTrip } from '@/lib/server/returns-repo';

const CLIENT = { clientType: 'BUSINESS' as const, companyName: 'Test SARL', fullName: 'Test Client', phone: '+212600000000' };
const CARRIER = { id: 'carrier-test', companyName: 'Test Transport', city: 'Casablanca', phone: '+212611111111' };

function makeJob(id: string) {
  return createJob(
    {
      clientId: 'client-test', client: CLIENT,
      cargoType: 'GENERAL', description: 'unit test cargo here', weightKg: 1000,
      fragile: false, hazmat: false,
      originCity: 'Casablanca', originAddress: 'addr a', destCity: 'Rabat', destAddress: 'addr b',
      pickupDateFrom: '2026-08-01', pickupDateTo: '2026-08-02', deliveryDate: '2026-08-03',
    },
    id,
    '2026-07-15T00:00:00Z',
  );
}

describe('bid acceptance', () => {
  it('accepts one bid, rejects the others, and assigns the job', () => {
    makeJob('job-test-accept');
    const b1 = submitBid({ jobId: 'job-test-accept', priceMAD: 3000, etaDays: 2, vehicleType: 'Camion 7.5T', carrier: CARRIER }, 'bid-t1', '2026-07-15T01:00:00Z');
    submitBid({ jobId: 'job-test-accept', priceMAD: 3500, etaDays: 1, vehicleType: 'Camion 12T', carrier: { ...CARRIER, id: 'carrier-test2' } }, 'bid-t2', '2026-07-15T02:00:00Z');

    const res = acceptBid(b1.id);
    expect(res.ok).toBe(true);

    const job = getJobDetail('job-test-accept')!;
    expect(job.status).toBe('ACCEPTED');
    expect(job.agreedPriceMAD).toBe(3000);
    expect(job.acceptedBidId).toBe('bid-t1');
    expect(typeof job.commissionRateSnap).toBe('number'); // rate locked at acceptance
    expect(job.bids.find((b) => b.id === 'bid-t2')!.status).toBe('REJECTED');
  });

  it('cannot accept an already-resolved bid', () => {
    const res = acceptBid('bid-t1');
    expect(res.ok).toBe(false);
  });
});

describe('job lifecycle', () => {
  it('exposes the legal next status', () => {
    expect(nextStatus('ACCEPTED')).toBe('PICKED_UP');
    expect(nextStatus('DELIVERED')).toBe('COMPLETED');
    expect(nextStatus('COMPLETED')).toBe(null);
  });

  it('advances through the chain and captures commission on completion', () => {
    makeJob('job-test-lc');
    const b = submitBid({ jobId: 'job-test-lc', priceMAD: 4000, etaDays: 2, vehicleType: 'Camion 7.5T', carrier: CARRIER }, 'bid-lc', '2026-07-15T03:00:00Z');
    acceptBid(b.id);

    expect(advanceJobStatus('job-test-lc', 'PICKED_UP').ok).toBe(true);
    expect(advanceJobStatus('job-test-lc', 'IN_TRANSIT').ok).toBe(true);
    expect(advanceJobStatus('job-test-lc', 'DELIVERED').ok).toBe(true);

    const done = advanceJobStatus('job-test-lc', 'COMPLETED');
    expect(done.ok).toBe(true);

    const job = getJobDetail('job-test-lc')!;
    expect(job.status).toBe('COMPLETED');
    expect(job.commissionCapturedMAD).toBeGreaterThan(0);
  });

  it('rejects an illegal transition (skipping a step)', () => {
    makeJob('job-test-skip');
    const r = advanceJobStatus('job-test-skip', 'DELIVERED'); // still PUBLISHED
    expect(r.ok).toBe(false);
  });
});

describe('return trips', () => {
  it('books an open trip and blocks double-booking', () => {
    createReturnTrip(
      { carrierId: 'carrier-test', carrierName: 'Test Transport', carrierCity: 'Casablanca',
        originCity: 'Rabat', destCity: 'Fès', availableDate: '2026-08-10', capacityKg: 5000,
        vehicleType: 'Camion 7.5T', listedPriceMAD: 2500 },
      'rt-test', '2026-07-15T04:00:00Z',
    );

    const first = bookReturnTrip('rt-test');
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.trip.status).toBe('BOOKED');

    const second = bookReturnTrip('rt-test');
    expect(second.ok).toBe(false); // already booked
  });
});
