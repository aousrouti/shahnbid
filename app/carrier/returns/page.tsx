import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import { mockReturnTrips } from '@/lib/mock-data/returns';
import { formatDate, formatWeight, formatMAD } from '@/lib/utils';
import { Plus, MapPin } from 'lucide-react';

export default function CarrierReturnsPage() {
  // Show the carrier's own return trips (mock: first 2)
  const myTrips = mockReturnTrips.slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes retours disponibles"
        subtitle={`${myTrips.length} trajet${myTrips.length !== 1 ? 's' : ''} publiés`}
        action={
          <Link href="/carrier/returns/new" className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
            <Plus size={16} /> Publier un retour
          </Link>
        }
      />

      <div className="bg-white border border-brand-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg border-b border-brand-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Trajet</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Capacité</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Prix</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {myTrips.map((trip) => (
              <tr key={trip.id} className="hover:bg-brand-bg transition-colors">
                <td className="px-5 py-3 font-medium text-brand-navy">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-brand-primary" />
                    {trip.originCity} → {trip.destCity}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{formatDate(trip.availableDate)}</td>
                <td className="px-5 py-3 text-gray-600">{formatWeight(trip.capacityKg)}</td>
                <td className="px-5 py-3 font-semibold text-brand-primary">{formatMAD(trip.listedPriceMAD)}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium bg-green-50 text-green-700">
                    Disponible
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
