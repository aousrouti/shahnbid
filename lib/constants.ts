// lib/constants.ts

export const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida',
  'Nador', 'Al Hoceima', 'Béni Mellal', 'Mohammadia', 'Khouribga', 'Settat',
  'Laâyoune', 'Dakhla', 'Taza',
] as const;

// Approximate [lat, lng] for each Moroccan city — used by the carrier map.
export const CITY_COORDS: Record<string, [number, number]> = {
  'Casablanca':  [33.5731, -7.5898],
  'Rabat':       [34.0209, -6.8416],
  'Marrakech':   [31.6295, -7.9811],
  'Fès':         [34.0181, -5.0078],
  'Tanger':      [35.7595, -5.8340],
  'Agadir':      [30.4278, -9.5981],
  'Meknès':      [33.8935, -5.5473],
  'Oujda':       [34.6814, -1.9086],
  'Kénitra':     [34.2610, -6.5802],
  'Tétouan':     [35.5785, -5.3684],
  'Safi':        [32.2994, -9.2372],
  'El Jadida':   [33.2316, -8.5007],
  'Nador':       [35.1681, -2.9335],
  'Al Hoceima':  [35.2517, -3.9372],
  'Béni Mellal': [32.3373, -6.3498],
  'Mohammadia':  [33.6863, -7.3829],
  'Khouribga':   [32.8811, -6.9063],
  'Settat':      [33.0010, -7.6166],
  'Laâyoune':    [27.1253, -13.1625],
  'Dakhla':      [23.6848, -15.9580],
  'Taza':        [34.2100, -4.0100],
};

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

// Default pricing rules — the seed values for the admin-editable PricingSettings.
// The live values are served from lib/pricing/store.ts; these are only the fallback.
export const DEFAULT_PRICING = {
  commissionRate: COMMISSION_RATE,   // 10%
  minCommissionMAD: 50,              // never charge less than 50 MAD
  vatRate: 0.20,                     // Moroccan TVA (20%) on the service fee
  minJobPriceMAD: 100,              // matches the legacy Zod floor
  commissionPayer: 'CARRIER' as const,
} as const;

export const COMMISSION_PAYER_LABELS: Record<string, string> = {
  CARRIER: 'Déduit du transporteur',
  CLIENT:  'Ajouté au client',
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'Particulier',
  BUSINESS:   'Entreprise',
};

export const DEFAULT_COUNTRY = 'Maroc';

// Registration is open beyond Morocco. Morocco first, then a broad list.
export const COUNTRIES = [
  'Maroc', 'Algérie', 'Tunisie', 'Libye', 'Mauritanie', 'Égypte',
  'Sénégal', "Côte d'Ivoire", 'Mali', 'Nigéria', 'Afrique du Sud',
  'France', 'Espagne', 'Portugal', 'Italie', 'Allemagne', 'Belgique',
  'Pays-Bas', 'Royaume-Uni', 'Suisse', 'Turquie',
  'Arabie saoudite', 'Émirats arabes unis', 'Qatar', 'Koweït',
  'États-Unis', 'Canada', 'Chine', 'Inde', 'Brésil', 'Autre',
] as const;

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
