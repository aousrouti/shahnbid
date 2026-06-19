// Platform pricing settings store (UX/scaffolding phase).
// Single global record, editable by an admin. HMR-safe via globalThis.
// Backend phase: replace with a `pricing_settings` table (single row, audited).
import { DEFAULT_PRICING } from '@/lib/constants';
import type { PricingSettings, CommissionBreakdown } from '@/lib/types';

const g = globalThis as unknown as { __shahnbidPricing?: PricingSettings };

const settings: PricingSettings =
  g.__shahnbidPricing ??
  (g.__shahnbidPricing = {
    ...DEFAULT_PRICING,
    updatedAt: '1970-01-01T00:00:00.000Z', // sentinel: "never edited" (seeded default)
    updatedBy: 'système',
  });

export function getPricingSettings(): PricingSettings {
  return { ...settings };
}

/** Editable fields an admin can change. */
export type PricingPatch = Pick<
  PricingSettings,
  'commissionRate' | 'minCommissionMAD' | 'vatRate' | 'minJobPriceMAD' | 'commissionPayer'
>;

export function updatePricingSettings(patch: PricingPatch, updatedBy: string, updatedAt: string): PricingSettings {
  Object.assign(settings, patch, { updatedBy, updatedAt });
  return { ...settings };
}

/**
 * Full commission breakdown for one completed shipment.
 * Commission = max(price * rate, floor); VAT applies on the commission.
 */
export function commissionBreakdown(
  agreedPriceMAD: number,
  s: PricingSettings = settings,
): CommissionBreakdown {
  const raw = agreedPriceMAD * s.commissionRate;
  const commissionMAD = Math.round(Math.max(raw, s.minCommissionMAD));
  const vatMAD = Math.round(commissionMAD * s.vatRate);
  const totalFeeMAD = commissionMAD + vatMAD;
  return {
    agreedPriceMAD,
    commissionMAD,
    vatMAD,
    totalFeeMAD,
    // Carrier keeps the price minus the fee when the carrier is the payer.
    carrierNetMAD: s.commissionPayer === 'CARRIER' ? agreedPriceMAD - totalFeeMAD : agreedPriceMAD,
    // Client pays the price plus the fee when the client is the payer.
    clientTotalMAD: s.commissionPayer === 'CLIENT' ? agreedPriceMAD + totalFeeMAD : agreedPriceMAD,
  };
}

/** Convenience: just the platform commission (floor enforced, excl. VAT). */
export function commissionAmount(agreedPriceMAD: number, s: PricingSettings = settings): number {
  return commissionBreakdown(agreedPriceMAD, s).commissionMAD;
}
