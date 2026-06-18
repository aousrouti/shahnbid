// lib/mock-data/bids.ts
import type { BidWithCarrier } from '../types';

export const mockBids: BidWithCarrier[] = [
  {
    id: 'bid-001',
    priceMAD:    3800,
    etaDays:     2,
    vehicleType: 'Camion 7.5T',
    notes:       'Disponible dès demain matin. Expérience en marchandises palettisées.',
    status:      'PENDING',
    carrier: {
      id:          'carrier-001',
      companyName: 'Atlas Transport Casablanca',
      city:        'Casablanca',
      phone:       '+212 6 61 11 22 33',
    },
    createdAt: '2026-06-28T10:30:00Z',
  },
  {
    id: 'bid-002',
    priceMAD:    3500,
    etaDays:     2,
    vehicleType: 'Camion 12T',
    notes:       'Prix compétitif. Livraison assurée dans les délais.',
    status:      'ACCEPTED',
    carrier: {
      id:          'carrier-002',
      companyName: 'Marrakech Express Freight',
      city:        'Marrakech',
      phone:       '+212 6 62 44 55 66',
    },
    createdAt: '2026-06-28T12:00:00Z',
  },
  {
    id: 'bid-003',
    priceMAD:    4200,
    etaDays:     3,
    vehicleType: 'Camion 7.5T',
    status:      'REJECTED',
    carrier: {
      id:          'carrier-003',
      companyName: 'Logistics Sud SARL',
      city:        'Agadir',
      phone:       '+212 6 63 77 88 99',
    },
    createdAt: '2026-06-28T14:45:00Z',
  },
];
