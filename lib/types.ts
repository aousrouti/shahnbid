// lib/types.ts

export type UserRole           = 'CLIENT' | 'CARRIER' | 'ADMIN';
export type ClientType         = 'INDIVIDUAL' | 'BUSINESS';   // B2C vs B2B client
export type JobStatus          = 'DRAFT' | 'PUBLISHED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type BidStatus          = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type CargoType          = 'GENERAL' | 'REFRIGERATED' | 'HAZMAT' | 'FRAGILE' | 'OVERSIZED' | 'LIVESTOCK';
export type CarrierStatus      = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type JobSource          = 'CLIENT_POSTED' | 'RETURN_TRIP';
export type AvailabilityStatus = 'OPEN' | 'BOOKED' | 'EXPIRED' | 'CANCELLED';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
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
