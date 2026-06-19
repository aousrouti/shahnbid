import { describe, it, expect } from 'vitest';
import { commissionBreakdown } from '@/lib/pricing/store';
import type { PricingSettings } from '@/lib/types';

const base: PricingSettings = {
  commissionRate: 0.10,
  minCommissionMAD: 50,
  vatRate: 0.20,
  minJobPriceMAD: 100,
  commissionPayer: 'CARRIER',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: 'test',
};

describe('commissionBreakdown', () => {
  it('applies the commission rate and VAT', () => {
    const b = commissionBreakdown(5000, base);
    expect(b.commissionMAD).toBe(500);   // 10%
    expect(b.vatMAD).toBe(100);          // 20% of 500
    expect(b.totalFeeMAD).toBe(600);
  });

  it('enforces the minimum commission floor', () => {
    const b = commissionBreakdown(200, base); // 10% = 20, floor 50 wins
    expect(b.commissionMAD).toBe(50);
  });

  it('deducts the fee from the carrier when payer = CARRIER', () => {
    const b = commissionBreakdown(5000, base);
    expect(b.carrierNetMAD).toBe(5000 - 600);
    expect(b.clientTotalMAD).toBe(5000);
  });

  it('adds the fee to the client when payer = CLIENT', () => {
    const b = commissionBreakdown(5000, { ...base, commissionPayer: 'CLIENT' });
    expect(b.clientTotalMAD).toBe(5000 + 600);
    expect(b.carrierNetMAD).toBe(5000);
  });

  it('honors a different (snapshotted) rate', () => {
    const b = commissionBreakdown(4000, { ...base, commissionRate: 0.10 });
    expect(b.commissionMAD).toBe(400); // snapshot rate, not a later change
  });
});
