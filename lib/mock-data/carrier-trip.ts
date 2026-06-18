// lib/mock-data/carrier-trip.ts — the logged-in carrier's current trip (UX phase mock).
// The carrier is driving Nador → Al Hoceima along the northern coast.

export const mockCarrierTrip = {
  fromCity: 'Nador',
  toCity: 'Al Hoceima',
  vehicleType: 'Semi-remorque 26T',
  capacityKg: 24000,
  freeCapacityKg: 9000,   // room left to pick up an on-the-way job
  defaultProgress: 0.45,  // 0..1 along the Nador → Al Hoceima leg
};
