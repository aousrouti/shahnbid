// Payments adapter. Free default = stub (simulates authorize/capture, no real
// money). Stripe later: add a StripePayments provider gated by STRIPE_SECRET_KEY
// (test mode is free) and select it here. The commission/fee math lives in
// lib/pricing/store.ts and is provider-agnostic.

export type PaymentStatus = 'AUTHORIZED' | 'CAPTURED' | 'FAILED';

export interface PaymentIntent {
  ref: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  readonly name: string;
  /** Hold the agreed amount when a bid is accepted. */
  authorize(input: { jobId: string; amountMAD: number }): Promise<PaymentIntent>;
  /** Capture (settle) the held amount when the job completes. */
  capture(ref: string): Promise<PaymentIntent>;
}

class StubPayments implements PaymentProvider {
  readonly name = 'stub';
  async authorize({ jobId }: { jobId: string; amountMAD: number }): Promise<PaymentIntent> {
    return { ref: `sim_${jobId}_${Date.now().toString(36)}`, status: 'AUTHORIZED' };
  }
  async capture(ref: string): Promise<PaymentIntent> {
    return { ref, status: 'CAPTURED' };
  }
}

let provider: PaymentProvider | null = null;

export function getPayments(): PaymentProvider {
  if (provider) return provider;
  // Stripe later: if (process.env.STRIPE_SECRET_KEY) provider = new StripePayments(...)
  provider = new StubPayments();
  return provider;
}
