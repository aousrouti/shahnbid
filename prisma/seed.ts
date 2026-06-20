// Seed ShahnBidDB with the demo accounts, jobs, bids, and return trips.
// Idempotent: clears the marketplace tables first, then re-inserts. Run with:
//   npx tsx prisma/seed.ts   (or: npx prisma db seed)
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';
import accountsSeed from '../lib/demo-data/accounts.json';
import { mockJobs, mockJobDetails } from '../lib/mock-data/jobs';
import { mockBids } from '../lib/mock-data/bids';
import { mockReturnTrips } from '../lib/mock-data/returns';
import { DEFAULT_PRICING } from '../lib/constants';

const prisma = new PrismaClient();

interface SeedAcct {
  id: string; role: string; email: string; password: string; fullName: string;
  phone?: string; clientType?: string; companyName?: string; ice?: string; address?: string;
  country?: string; city?: string; status?: string; licenseNumber?: string; insuranceExpiry?: string;
}

// Extra carrier profiles referenced by seeded return trips (not in accounts.json).
const EXTRA_CARRIERS = [
  { id: 'carrier-004', companyName: 'Souss Logistique SARL', city: 'Agadir', fullName: 'Rachid Souss' },
  { id: 'carrier-005', companyName: 'Nord Fret Tanger', city: 'Tanger', fullName: 'Hamid Nord' },
];

async function main() {
  // Clear in FK-safe order.
  await prisma.pushSubscription.deleteMany();
  await prisma.carrierNotification.deleteMany();
  await prisma.adminNotification.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.returnTrip.deleteMany();
  await prisma.job.deleteMany();
  await prisma.profile.deleteMany();

  // Accounts (hash the plaintext demo passwords).
  for (const a of accountsSeed.accounts as unknown as SeedAcct[]) {
    await prisma.profile.create({
      data: {
        id: a.id, role: a.role, email: a.email, passwordHash: hashPassword(a.password),
        fullName: a.fullName, phone: a.phone, clientType: a.clientType, companyName: a.companyName,
        ice: a.ice, address: a.address, country: a.country, city: a.city,
        status: a.status, licenseNumber: a.licenseNumber, insuranceExpiry: a.insuranceExpiry,
      },
    });
  }
  for (const c of EXTRA_CARRIERS) {
    await prisma.profile.create({
      data: {
        id: c.id, role: 'CARRIER', email: `${c.id}@shahnbid.ma`, passwordHash: hashPassword('Carrier2026'),
        fullName: c.fullName, companyName: c.companyName, city: c.city, country: 'Maroc',
        status: 'APPROVED', licenseNumber: `TRP-${c.id}`,
      },
    });
  }

  // Jobs (all owned by the demo client client-001).
  for (const s of mockJobs) {
    const d = mockJobDetails[s.id];
    await prisma.job.create({
      data: {
        id: s.id, clientId: 'client-001', source: s.source, status: s.status, cargoType: s.cargoType,
        description: d?.description ?? `${s.originCity} → ${s.destCity}`,
        weightKg: s.weightKg, fragile: d?.fragile ?? s.cargoType === 'FRAGILE', hazmat: d?.hazmat ?? s.cargoType === 'HAZMAT',
        originCity: s.originCity, originAddress: d?.originAddress ?? s.originCity,
        destCity: s.destCity, destAddress: d?.destAddress ?? s.destCity,
        pickupDateFrom: new Date(s.pickupDateFrom), deliveryDate: new Date(s.deliveryDate),
        notes: d?.notes, photoUrls: '[]', agreedPriceMAD: s.agreedPriceMAD, createdAt: new Date(s.createdAt),
      },
    });
  }

  // Bids (seeded against job-001).
  for (const b of mockBids) {
    await prisma.bid.create({
      data: {
        id: b.id, jobId: 'job-001', carrierId: b.carrier.id, priceMAD: b.priceMAD, etaDays: b.etaDays,
        vehicleType: b.vehicleType, notes: b.notes, status: b.status, createdAt: new Date(b.createdAt),
      },
    });
  }

  // Return trips.
  let i = 0;
  for (const t of mockReturnTrips) {
    await prisma.returnTrip.create({
      data: {
        id: t.id, carrierId: t.carrierId, originCity: t.originCity, destCity: t.destCity,
        availableDate: new Date(t.availableDate), capacityKg: t.capacityKg, vehicleType: t.vehicleType,
        listedPriceMAD: t.listedPriceMAD, notes: t.notes, status: t.status,
        createdAt: new Date(`2026-07-01T0${i++}:00:00Z`),
      },
    });
  }

  // Pricing settings (single row).
  await prisma.pricingSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...DEFAULT_PRICING, updatedBy: 'système' },
    update: {},
  });

  const counts = {
    profiles: await prisma.profile.count(),
    jobs: await prisma.job.count(),
    bids: await prisma.bid.count(),
    returnTrips: await prisma.returnTrip.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
