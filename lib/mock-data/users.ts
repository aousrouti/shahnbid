// lib/mock-data/users.ts

import type { ClientProfile } from '@/lib/types';

// B2B client — a company shipping commercial cargo.
export const mockClientProfile: ClientProfile = {
  id:             'client-001',
  profileId:      'profile-001',
  email:          'contact@imexmaroc.ma',
  fullName:       'Karim Benali',
  phone:          '+212 6 12 34 56 78',
  role:           'CLIENT',
  clientType:     'BUSINESS',
  companyName:    'Imex Maroc SARL',
  ice:            '001234567000089',
  address:        'Zone Industrielle Aïn Sebaâ, Lot 42',
  country:        'Maroc',
  city:           'Casablanca',
  createdAt:      '2026-01-15T09:00:00Z',
};

// B2C client — an individual shipping personal goods.
export const mockIndividualClientProfile: ClientProfile = {
  id:             'client-002',
  profileId:      'profile-010',
  email:          'salma.bennani@gmail.com',
  fullName:       'Salma Bennani',
  phone:          '+212 6 70 88 99 00',
  role:           'CLIENT',
  clientType:     'INDIVIDUAL',
  country:        'Maroc',
  city:           'Rabat',
  createdAt:      '2026-05-02T16:00:00Z',
};

export const mockAllClients: ClientProfile[] = [
  mockClientProfile,
  mockIndividualClientProfile,
];

export const mockApprovedCarrier = {
  id:              'carrier-001',
  profileId:       'profile-002',
  email:           'contact@atlastransport.ma',
  fullName:        'Hassan Ouali',
  phone:           '+212 6 61 11 22 33',
  role:            'CARRIER' as const,
  companyName:     'Atlas Transport Casablanca',
  city:            'Casablanca',
  licenseNumber:   'TRP-2024-CAS-0042',
  insuranceExpiry: '2027-03-31',
  status:          'APPROVED' as const,
  approvedAt:      '2026-02-10T14:00:00Z',
  createdAt:       '2026-01-20T08:30:00Z',
};

export const mockPendingCarrier = {
  id:              'carrier-002',
  profileId:       'profile-003',
  email:           'info@marrakechexpress.ma',
  fullName:        'Youssef Ait Brahim',
  phone:           '+212 6 62 44 55 66',
  role:            'CARRIER' as const,
  companyName:     'Marrakech Express Freight',
  city:            'Marrakech',
  licenseNumber:   'TRP-2025-MRK-0017',
  insuranceExpiry: '2026-12-31',
  status:          'PENDING' as const,
  createdAt:       '2026-06-20T10:00:00Z',
};

export const mockAllCarriers = [
  mockApprovedCarrier,
  mockPendingCarrier,
  {
    id:              'carrier-003',
    profileId:       'profile-004',
    email:           'contact@logistiquesudsarl.ma',
    fullName:        'Rachid Tazi',
    phone:           '+212 6 63 77 88 99',
    role:            'CARRIER' as const,
    companyName:     'Logistics Sud SARL',
    city:            'Agadir',
    licenseNumber:   'TRP-2025-AGA-0009',
    insuranceExpiry: '2027-06-30',
    status:          'APPROVED' as const,
    approvedAt:      '2026-03-05T09:00:00Z',
    createdAt:       '2026-02-28T11:00:00Z',
  },
  {
    id:              'carrier-004',
    profileId:       'profile-005',
    email:           'souss@logistique.ma',
    fullName:        'Mohammed Sabir',
    phone:           '+212 6 64 00 11 22',
    role:            'CARRIER' as const,
    companyName:     'Souss Logistique SARL',
    city:            'Agadir',
    licenseNumber:   'TRP-2024-AGA-0031',
    insuranceExpiry: '2026-09-15',
    status:          'PENDING' as const,
    createdAt:       '2026-06-27T13:00:00Z',
  },
];
