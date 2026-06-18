'use client';

import { createContext, useContext } from 'react';
import { useGeolocation, type GeolocationState } from '@/lib/hooks/useGeolocation';

const LocationContext = createContext<GeolocationState | null>(null);

/**
 * Shares a single live-location state across the carrier portal so the map,
 * dashboard, and the global status bar all reflect the same sharing state.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const geo = useGeolocation();
  return <LocationContext.Provider value={geo}>{children}</LocationContext.Provider>;
}

export function useCarrierLocation(): GeolocationState {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useCarrierLocation must be used within a LocationProvider');
  return ctx;
}
