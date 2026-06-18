// lib/constants.ts

export const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida',
  'Nador', 'Béni Mellal', 'Mohammadia', 'Khouribga', 'Settat',
  'Laâyoune', 'Dakhla', 'Taza',
] as const;

export const CARGO_TYPE_LABELS: Record<string, string> = {
  GENERAL:      'Général',
  REFRIGERATED: 'Réfrigéré',
  HAZMAT:       'Matières dangereuses',
  FRAGILE:      'Fragile',
  OVERSIZED:    'Hors gabarit',
  LIVESTOCK:    'Bétail',
};

export const VEHICLE_TYPES = [
  'Camion 3.5T',
  'Camion 7.5T',
  'Camion 12T',
  'Camion 19T',
  'Semi-remorque 26T',
  'Camion frigorifique',
  'Plateau',
] as const;

export const COMMISSION_RATE = 0.10;

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT:      'Brouillon',
  PUBLISHED:  'Ouvert aux offres',
  ACCEPTED:   'Transporteur assigné',
  PICKED_UP:  'Collecté',
  IN_TRANSIT: 'En transit',
  DELIVERED:  'Livré',
  COMPLETED:  'Terminé',
  CANCELLED:  'Annulé',
};

export const BID_STATUS_LABELS: Record<string, string> = {
  PENDING:   'En attente',
  ACCEPTED:  'Acceptée',
  REJECTED:  'Refusée',
  WITHDRAWN: 'Retirée',
};

export const CARRIER_STATUS_LABELS: Record<string, string> = {
  PENDING:   'En attente',
  APPROVED:  'Approuvé',
  REJECTED:  'Refusé',
  SUSPENDED: 'Suspendu',
};
