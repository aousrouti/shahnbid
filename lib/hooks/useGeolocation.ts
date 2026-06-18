'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng } from '@/lib/geo';

const CONSENT_KEY = 'shahnbid.geo.consent';

export type GeoStatus = 'unsupported' | 'idle' | 'prompting' | 'granted' | 'denied' | 'error';

export interface GeolocationState {
  status: GeoStatus;
  position: LatLng | null;
  accuracy: number | null;
  enable: () => void;
  disable: () => void;
}

/**
 * Opt-in live location for carriers. Watches position once the user consents,
 * remembers consent in localStorage, and auto-resumes if the browser permission
 * is still granted on a later visit.
 */
export function useGeolocation(): GeolocationState {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const watchId = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (watchId.current != null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
  }, []);

  const begin = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('prompting');
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setStatus('granted');
        try { localStorage.setItem(CONSENT_KEY, '1'); } catch { /* ignore */ }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          try { localStorage.removeItem(CONSENT_KEY); } catch { /* ignore */ }
        } else {
          setStatus((s) => (s === 'granted' ? 'granted' : 'error'));
        }
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
  }, []);

  const enable = useCallback(() => begin(), [begin]);

  const disable = useCallback(() => {
    clear();
    setPosition(null);
    setAccuracy(null);
    setStatus('idle');
    try { localStorage.removeItem(CONSENT_KEY); } catch { /* ignore */ }
  }, [clear]);

  // Auto-resume on mount when previously consented and still permitted.
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if (!('geolocation' in navigator)) { setStatus('unsupported'); return; }

    let consented = false;
    try { consented = localStorage.getItem(CONSENT_KEY) === '1'; } catch { /* ignore */ }
    if (!consented) return;

    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((p) => {
          if (p.state === 'granted') begin();
          else if (p.state === 'denied') setStatus('denied');
        })
        .catch(() => begin());
    } else {
      begin();
    }

    return clear;
  }, [begin, clear]);

  return { status, position, accuracy, enable, disable };
}
