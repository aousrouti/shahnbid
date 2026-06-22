import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { listReturnTrips } from '@/lib/server/returns-repo';
import { getCurrentUser } from '@/lib/auth/current-user';
import ActionButton from '@/components/shared/ActionButton';
import { formatDate, formatWeight, formatMAD } from '@/lib/utils';
import { Plus, MapPin, RotateCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  OPEN:      'bg-green-50 text-green-700',
  BOOKED:    'bg-blue-50 text-blue-700',
  EXPIRED:   'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-50 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  OPEN:      'Disponible',
  BOOKED:    'Réservé',
  EXPIRED:   'Expiré',
  CANCELLED: 'Annulé',
};

export default async function CarrierReturnsPage() {
  const user = await getCurrentUser();
  const myTrips = user ? await listReturnTrips({ carrierId: user.id }) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes retours disponibles"
        subtitle={`${myTrips.length} trajet${myTrips.length !== 1 ? 's' : ''} publié${myTrips.length !== 1 ? 's' : ''}`}
        action={
          <Link href="/carrier/returns/new" className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
            <Plus size={16} /> Publier un retour
          </Link>
        }
      />

      {myTrips.length === 0 ? (
        <EmptyState
          icon={<RotateCcw size={48} />}
          title="Aucun retour publié"
          body="Proposez votre camion de retour à un prix fixe pour le rentabiliser."
          action={
            <Link href="/carrier/returns/new" className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
              Publier un retour
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-brand-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-bg border-b border-brand-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Trajet</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Capacité</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Prix</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium ${STATUS_STYLES[trip.status]}`}>
                      {STATUS_LABELS[trip.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {trip.status === 'OPEN' && (
                      <ActionButton
                        url={`/api/returns/${trip.id}`}
                        body={{ action: 'CANCEL' }}
                        label="Annuler"
                        confirm="Annuler ce retour ?"
                        variant="subtle"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
