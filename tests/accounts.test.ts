import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { addAccount, findByCredentials, emailExists, setCarrierStatus } from '@/lib/demo-data/accounts';
import { getPricingSettings, updatePricingSettings } from '@/lib/pricing/store';

const dbDescribe = process.env.DATABASE_URL ? describe : describe.skip;
const sfx = crypto.randomUUID().slice(0, 8);

dbDescribe('account store (SQL Server)', () => {
  const email = `acct-${sfx}@t.test`;
  let createdId = '';

  afterAll(async () => {
    await prisma.profile.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('creates a carrier with a hashed password and verifies credentials', async () => {
    const acct = await addAccount({
      role: 'CARRIER', email, password: 'StrongPass!1', fullName: 'Acct Test',
      companyName: 'Acct Co', city: 'Casablanca', status: 'PENDING',
    });
    createdId = acct.id;
    expect(acct).not.toHaveProperty('passwordHash'); // never leaked

    const row = await prisma.profile.findUnique({ where: { id: acct.id } });
    expect(row?.passwordHash).not.toContain('StrongPass!1'); // stored hashed

    expect(await findByCredentials(email, 'StrongPass!1')).not.toBeNull();
    expect(await findByCredentials(email, 'wrong')).toBeNull();
    expect(await emailExists(email)).toBe(true);
  });

  it('updates carrier approval status', async () => {
    const updated = await setCarrierStatus(createdId, 'APPROVED');
    expect(updated?.status).toBe('APPROVED');
  });
});

dbDescribe('pricing settings (SQL Server)', () => {
  it('reads defaults and persists an update', async () => {
    const original = await getPricingSettings();
    try {
      const next = await updatePricingSettings(
        { commissionRate: 0.15, minCommissionMAD: 60, vatRate: 0.2, minJobPriceMAD: 120, commissionPayer: 'CLIENT' },
        'test@shahnbid.ma',
      );
      expect(next.commissionRate).toBe(0.15);
      expect(next.commissionPayer).toBe('CLIENT');
      expect((await getPricingSettings()).commissionRate).toBe(0.15); // persisted
    } finally {
      // Restore so we don't pollute the live settings.
      await updatePricingSettings(
        {
          commissionRate: original.commissionRate, minCommissionMAD: original.minCommissionMAD,
          vatRate: original.vatRate, minJobPriceMAD: original.minJobPriceMAD, commissionPayer: original.commissionPayer,
        },
        original.updatedBy,
      );
      await prisma.$disconnect();
    }
  });
});
