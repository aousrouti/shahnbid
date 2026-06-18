// lib/geo.ts — lightweight geo helpers for the carrier map (UX phase, no API).
import { CITY_COORDS } from './constants';
import type { JobSummary } from './types';

export type LatLng = [number, number]; // [lat, lng]

const R = 6371; // km
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance between two points, in km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const lat1 = rad(a[0]);
  const lat2 = rad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Coordinates for a city name (undefined if unknown). */
export function cityCoords(city: string): LatLng | undefined {
  return CITY_COORDS[city];
}

/** Linear interpolation between two points (t in 0..1). Good enough at country scale. */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/**
 * Project point P onto the line through A→B in a local km plane.
 * Returns the perpendicular distance (km) and the unclamped position `t`
 * along the line (0 = at A, 1 = at B, >1 = beyond B, <0 = before A).
 */
export function projectOntoLine(p: LatLng, a: LatLng, b: LatLng): { distKm: number; t: number } {
  const kmPerDegLat = 111;
  const kmPerDegLng = 111 * Math.cos(rad(a[0]));
  const toXY = (q: LatLng): [number, number] => [
    (q[1] - a[1]) * kmPerDegLng,
    (q[0] - a[0]) * kmPerDegLat,
  ];
  const [px, py] = toXY(p);
  const [bx, by] = toXY(b);
  const len2 = bx * bx + by * by;
  const t = len2 === 0 ? 0 : (px * bx + py * by) / len2;
  const tc = Math.max(0, Math.min(1, t));
  return { distKm: Math.hypot(px - tc * bx, py - tc * by), t };
}

/** Perpendicular distance (km) from P to the segment A→B. */
export function pointToSegmentKm(p: LatLng, a: LatLng, b: LatLng): number {
  return projectOntoLine(p, a, b).distKm;
}

export interface JobSuggestion {
  job: JobSummary;
  origin: LatLng;
  dest: LatLng;
  /** Distance from the carrier's route corridor to the job pickup (km). */
  corridorKm: number;
  /** Approx. extra driving to divert to the pickup and rejoin the route (km). */
  detourKm: number;
  /** Distance from the carrier's current position to the pickup (km). */
  distanceKm: number;
  /** True when the pickup is near the route AND the job continues in the travel direction. */
  onTheWay: boolean;
}

export interface SuggestParams {
  carrierPos: LatLng;
  carrierFrom: LatLng;
  carrierTo: LatLng;
  jobs: JobSummary[];
  corridorThresholdKm?: number; // pickup must be within this of the route
}

/**
 * Rank PUBLISHED jobs by how well they fit the carrier's current trip.
 * Corridor + forward-chaining heuristic (no routing engine): a job is "on the way"
 * when its pickup is near the carrier's route AND the job's destination lies further
 * along the direction of travel (so collecting it doesn't send the carrier backward).
 * detourKm ≈ 2 × corridor distance (divert off the route to the pickup and return).
 */
export function suggestJobsOnRoute({
  carrierPos,
  carrierFrom,
  carrierTo,
  jobs,
  corridorThresholdKm = 60,
}: SuggestParams): JobSuggestion[] {
  const out: JobSuggestion[] = [];

  for (const job of jobs) {
    const origin = cityCoords(job.originCity);
    const dest = cityCoords(job.destCity);
    if (!origin || !dest) continue;

    const o = projectOntoLine(origin, carrierFrom, carrierTo);
    const d = projectOntoLine(dest, carrierFrom, carrierTo);

    const corridorKm = o.distKm;
    const distanceKm = haversineKm(carrierPos, origin);
    const detourKm = 2 * corridorKm;

    // Forward-chaining: pickup not far behind the start, and dropoff is ahead of pickup.
    const forward = o.t >= -0.25 && d.t >= o.t - 0.05;
    const onTheWay = corridorKm <= corridorThresholdKm && forward;

    out.push({ job, origin, dest, corridorKm, detourKm, distanceKm, onTheWay });
  }

  // On-the-way first, then nearest to the route.
  return out.sort((a, b) => {
    if (a.onTheWay !== b.onTheWay) return a.onTheWay ? -1 : 1;
    return a.corridorKm - b.corridorKm;
  });
}

export function formatKm(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
