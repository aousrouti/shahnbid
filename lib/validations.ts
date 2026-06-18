// lib/validations.ts
import { z } from 'zod';

export const registerClientSchema = z.object({
  clientType:  z.enum(['INDIVIDUAL', 'BUSINESS']),
  email:       z.string().email('Email invalide'),
  password:    z.string().min(8, 'Minimum 8 caractères'),
  fullName:    z.string().min(2, 'Nom requis'),
  phone:       z.string().regex(/^(\+212|0)[567]\d{8}$/, 'Numéro marocain invalide'),
  city:        z.string().min(2, 'Ville requise'),
  // Business-only fields — optional at the type level, enforced below for BUSINESS.
  companyName: z.string().optional(),
  ice:         z.string().optional(),
  address:     z.string().optional(),
}).superRefine((d, ctx) => {
  if (d.clientType === 'BUSINESS') {
    if (!d.companyName || d.companyName.trim().length < 2)
      ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Raison sociale requise' });
    if (!d.ice || !/^\d{15}$/.test(d.ice))
      ctx.addIssue({ code: 'custom', path: ['ice'], message: 'ICE invalide (15 chiffres)' });
    if (!d.address || d.address.trim().length < 5)
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'Adresse requise' });
  }
});

export const registerCarrierSchema = z.object({
  email:           z.string().email('Email invalide'),
  password:        z.string().min(8, 'Minimum 8 caractères'),
  fullName:        z.string().min(2, 'Nom requis'),
  phone:           z.string().regex(/^(\+212|0)[567]\d{8}$/, 'Numéro marocain invalide'),
  companyName:     z.string().min(2, 'Raison sociale requise'),
  city:            z.string().min(2, 'Ville requise'),
  licenseNumber:   z.string().min(3, 'Numéro de licence requis'),
  insuranceExpiry: z.string().refine(
    (d) => new Date(d) > new Date(),
    "L'assurance doit être en cours de validité",
  ),
});

export const postJobSchema = z.object({
  cargoType:      z.enum(['GENERAL', 'REFRIGERATED', 'HAZMAT', 'FRAGILE', 'OVERSIZED', 'LIVESTOCK']),
  description:    z.string().min(10).max(500),
  weightKg:       z.number().min(1).max(50000),
  fragile:        z.boolean(),
  hazmat:         z.boolean(),
  originCity:     z.string().min(2),
  originAddress:  z.string().min(5),
  destCity:       z.string().min(2),
  destAddress:    z.string().min(5),
  pickupDateFrom: z.string().refine((d) => new Date(d) >= new Date(), 'Date passée'),
  pickupDateTo:   z.string(),
  deliveryDate:   z.string(),
  notes:          z.string().max(300).optional(),
}).refine(
  (d) => new Date(d.pickupDateTo) >= new Date(d.pickupDateFrom),
  { message: 'Date de fin avant date de début', path: ['pickupDateTo'] },
);

export const submitBidSchema = z.object({
  priceMAD:    z.number().min(100, 'Prix minimum 100 MAD'),
  etaDays:     z.number().int().min(1).max(30),
  vehicleType: z.string().min(2),
  notes:       z.string().max(300).optional(),
});

export const postReturnTripSchema = z.object({
  originCity:     z.string().min(2),
  destCity:       z.string().min(2),
  availableDate:  z.string().refine((d) => new Date(d) >= new Date(), 'Date passée'),
  capacityKg:     z.number().min(100).max(50000),
  vehicleType:    z.string().min(2),
  listedPriceMAD: z.number().min(100, 'Prix minimum 100 MAD'),
  notes:          z.string().max(300).optional(),
}).refine(
  (d) => d.originCity !== d.destCity,
  { message: 'Origine et destination identiques', path: ['destCity'] },
);

export type RegisterClientInput  = z.infer<typeof registerClientSchema>;
export type RegisterCarrierInput = z.infer<typeof registerCarrierSchema>;
export type PostJobInput          = z.infer<typeof postJobSchema>;
export type SubmitBidInput        = z.infer<typeof submitBidSchema>;
export type PostReturnTripInput   = z.infer<typeof postReturnTripSchema>;
