// Platform pricing settings — single row in SQL Server (id = 1) via Prisma.
// The math helpers stay pure (they take a settings object), so they're reusable
// in pages, the repos, and unit tests without touching the database.
import { prisma } from '@/lib/prisma';
import { DEFAULT_PRICING } from '@/lib/constants';
import type { PricingSettings, CommissionBreakdown, CommissionPayer } from '@/lib/types';
import type { PricingSettings as PricingRow } from '@prisma/client';

function toSettings(r: PricingRow): PricingSettings {
  return {
    commissionRate: r.commissionRate,
    minCommissionMAD: r.minCommissionMAD,
    vatRate: r.vatRate,
    minJobPriceMAD: r.minJobPriceMAD,
    commissionPayer: r.commissionPayer as CommissionPayer,
    updatedAt: r.updatedAt.toISOString(),
    updatedBy: r.updatedBy,
  };
}

/** Read the live settings, seeding the default row on first use. */
export async function getPricingSettings(): Promise<PricingSettings> {
  const row = await prisma.pricingSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      commissionRate: DEFAULT_PRICING.commissionRate,
      minCommissionMAD: DEFAULT_PRICING.minCommissionMAD,
      vatRate: DEFAULT_PRICING.vatRate,
      minJobPriceMAD: DEFAULT_PRICING.minJobPriceMAD,
      commissionPayer: DEFAULT_PRICING.commissionPayer,
      updatedBy: 'système',
    },
    update: {},
  });
  return toSettings(row);
}

export type PricingPatch = Pick<
  PricingSettings,
  'commissionRate' | 'minCommissionMAD' | 'vatRate' | 'minJobPriceMAD' | 'commissionPayer'
>;

export async function updatePricingSettings(patch: PricingPatch, updatedBy: string): Promise<PricingSettings> {
  const row = await prisma.pricingSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...patch, updatedBy },
    update: { ...patch, updatedBy },
  });
  return toSettings(row);
}

/**
 * Full commission breakdown for one completed shipment (pure).
 * Commission = max(price * rate, floor); VAT applies on the commission.
 */
export function commissionBreakdown(agreedPriceMAD: number, s: PricingSettings): CommissionBreakdown {
  const raw = agreedPriceMAD * s.commissionRate;
  const commissionMAD = Math.round(Math.max(raw, s.minCommissionMAD));
  const vatMAD = Math.round(commissionMAD * s.vatRate);
  const totalFeeMAD = commissionMAD + vatMAD;
  return {
    agreedPriceMAD,
    commissionMAD,
    vatMAD,
    totalFeeMAD,
    carrierNetMAD: s.commissionPayer === 'CARRIER' ? agreedPriceMAD - totalFeeMAD : agreedPriceMAD,
    clientTotalMAD: s.commissionPayer === 'CLIENT' ? agreedPriceMAD + totalFeeMAD : agreedPriceMAD,
  };
}

/** Convenience: just the platform commission (floor enforced, excl. VAT). */
export function commissionAmount(agreedPriceMAD: number, s: PricingSettings): number {
  return commissionBreakdown(agreedPriceMAD, s).commissionMAD;
}
