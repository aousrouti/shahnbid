'use client';

import { useEffect, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng, JobSuggestion } from '@/lib/geo';
import { formatKm } from '@/lib/geo';
import { CARGO_TYPE_LABELS } from '@/lib/constants';

function pin(bg: string, glyph: string, ring = false): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${bg};color:#fff;font-size:13px;font-weight:700;
      box-shadow:0 1px 4px rgba(0,0,0,.4);${ring ? 'outline:3px solid rgba(15,110,86,.25);' : ''}">
        <span style="transform:rotate(45deg)">${glyph}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

function truck(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:38px;height:38px;border-radius:50%;
      background:#1A56A3;color:#fff;font-size:18px;
      box-shadow:0 0 0 6px rgba(26,86,163,.25),0 2px 6px rgba(0,0,0,.4);">🚚</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

const ICON = {
  carrier: truck(),
  start: pin('#1C2B4A', 'D'),
  end: pin('#1C2B4A', 'A'),
  pickupOnWay: pin('#0F6E56', '↑', true),
  pickupOff: pin('#6B7280', '•'),
  drop: pin('#A32D2D', '⚑'),
};

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, points]);
  return null;
}

export interface RouteMapProps {
  carrierPos: LatLng;
  carrierFrom: LatLng;
  carrierTo: LatLng;
  fromCity: string;
  toCity: string;
  suggestions: JobSuggestion[];
}

export default function RouteMap({ carrierPos, carrierFrom, carrierTo, fromCity, toCity, suggestions }: RouteMapProps) {
  const allPoints: LatLng[] = [
    carrierFrom, carrierTo, carrierPos,
    ...suggestions.flatMap((s) => [s.origin, s.dest]),
  ];

  return (
    <MapContainer
      center={carrierPos}
      zoom={8}
      scrollWheelZoom
      className="h-full w-full rounded-card"
      style={{ minHeight: 420 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Carrier's current leg */}
      <Polyline positions={[carrierFrom, carrierTo]} pathOptions={{ color: '#1A56A3', weight: 5, opacity: 0.85 }} />
      <Marker position={carrierFrom} icon={ICON.start}><Popup>Départ — {fromCity}</Popup></Marker>
      <Marker position={carrierTo} icon={ICON.end}><Popup>Destination — {toCity}</Popup></Marker>
      <Marker position={carrierPos} icon={ICON.carrier}><Popup>Votre position</Popup></Marker>

      {/* Suggested jobs */}
      {suggestions.map((s) => (
        <Fragment key={s.job.id}>
          {s.onTheWay && (
            <Polyline
              positions={[s.origin, s.dest]}
              pathOptions={{ color: '#0F6E56', weight: 4, opacity: 0.9, dashArray: '6 6' }}
            />
          )}
          <Marker position={s.origin} icon={s.onTheWay ? ICON.pickupOnWay : ICON.pickupOff}>
            <Popup>
              <strong>{s.job.originCity} → {s.job.destCity}</strong><br />
              {CARGO_TYPE_LABELS[s.job.cargoType]} · {s.job.weightKg.toLocaleString('fr-FR')} kg<br />
              {s.onTheWay
                ? <span style={{ color: '#0F6E56' }}>Sur votre route · détour {formatKm(s.detourKm)}</span>
                : <span style={{ color: '#6B7280' }}>Détour {formatKm(s.detourKm)}</span>}
            </Popup>
          </Marker>
          {s.onTheWay && <Marker position={s.dest} icon={ICON.drop}><Popup>Livraison — {s.job.destCity}</Popup></Marker>}
        </Fragment>
      ))}

      <FitBounds points={allPoints} />
    </MapContainer>
  );
}
