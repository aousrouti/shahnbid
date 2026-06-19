// lib/types.ts

export type UserRole           = 'CLIENT' | 'CARRIER' | 'ADMIN';
export type ClientType         = 'INDIVIDUAL' | 'BUSINESS';   // B2C vs B2B client
export type JobStatus          = 'DRAFT' | 'PUBLISHED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type BidStatus          = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type CargoType          = 'GENERAL' | 'REFRIGERATED' | 'HAZMAT' | 'FRAGILE' | 'OVERSIZED' | 'LIVESTOCK';
export type CarrierStatus      = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type JobSource          = 'CLIENT_POSTED' | 'RETURN_TRIP';
export type AvailabilityStatus = 'OPEN' | 'BOOKED' | 'EXPIRED' | 'CANCELLED';
export type CommissionPayer    = 'CARRIER' | 'CLIENT';   // who bears the platform fee

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/** Platform-wide pricing rules, editable by an admin. */
export interface PricingSettings {
  commissionRate: number;        // fraction on agreed price, e.g. 0.10 = 10%
  minCommissionMAD: number;      // floor applied to the commission
  vatRate: number;               // TVA on the commission service fee, e.g. 0.20 = 20%
  minJobPriceMAD: number;        // minimum allowed bid / listing price
  commissionPayer: CommissionPayer;
  updatedAt: string;
  updatedBy: string;             // email of the admin who last changed it
}

/** Derived breakdown for a single completed shipment. */
export interface CommissionBreakdown {
  agreedPriceMAD: number;
  commissionMAD: number;         // platform fee (rate applied, floor enforced)
  vatMAD: number;                // TVA on the commission
  totalFeeMAD: number;           // commission + VAT
  carrierNetMAD: number;         // what the carrier keeps (if payer = CARRIER)
  clientTotalMAD: number;        // what the client pays (if payer = CLIENT)
}

export interface JobSummary {
  id: string;
  source: JobSource;
  status: JobStatus;
  cargoType: CargoType;
  weightKg: number;
  originCity: string;
  destCity: string;
  pickupDateFrom: string;
  deliveryDate: string;
  bidCount: number;
  agreedPriceMAD?: number;
  commissionRateSnap?: number;     // rate locked in at bid acceptance
  commissionCapturedMAD?: number;  // realized when the job reaches COMPLETED
  createdAt: string;
}

export interface JobDetail extends JobSummary {
  description: string;
  fragile: boolean;
  hazmat: boolean;
  originAddress: string;
  destAddress: string;
  notes?: string;
  photoUrls: string[];
  bids: BidWithCarrier[];
  acceptedBidId?: string;
  client: { clientType: ClientType; companyName?: string; fullName: string; phone: string };
}

export interface ClientProfile {
  id: string;
  profileId: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'CLIENT';
  clientType: ClientType;
  companyName?: string;   // BUSINESS only
  ice?: string;           // BUSINESS only — Moroccan company tax ID (15 digits)
  address?: string;       // BUSINESS only
  city: string;
  country: string;
  createdAt: string;
}

export interface BidWithCarrier {
  id: string;
  priceMAD: number;
  etaDays: number;
  vehicleType: string;
  notes?: string;
  status: BidStatus;
  carrier: { id: string; companyName: string; city: string; phone: string };
  createdAt: string;
}

export interface ReturnTrip {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierCity: string;
  originCity: string;
  destCity: string;
  availableDate: string;
  capacityKg: number;
  vehicleType: string;
  listedPriceMAD: number;
  notes?: string;
  status: AvailabilityStatus;
}

export interface PostJobPayload {
  cargoType: CargoType;
  description: string;
  weightKg: number;
  fragile: boolean;
  hazmat: boolean;
  originCity: string;
  originAddress: string;
  destCity: string;
  destAddress: string;
  pickupDateFrom: string;
  pickupDateTo: string;
  deliveryDate: string;
  notes?: string;
}

export interface SubmitBidPayload {
  jobId: string;
  priceMAD: number;
  etaDays: number;
  vehicleType: string;
  notes?: string;
}

export interface PostReturnTripPayload {
  originCity: string;
  destCity: string;
  availableDate: string;
  capacityKg: number;
  vehicleType: string;
  listedPriceMAD: number;
  notes?: string;
}

export interface RegisterClientPayload {
  clientType: ClientType;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  companyName?: string;   // BUSINESS only
  ice?: string;           // BUSINESS only
  address?: string;       // BUSINESS only
}

export interface RegisterCarrierPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  companyName: string;
  country: string;
  city: string;
  licenseNumber: string;
  insuranceExpiry: string;
}
