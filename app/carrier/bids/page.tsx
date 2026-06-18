import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/jobs/StatusBadge';
import { mockBids } from '@/lib/mock-data/bids';
import { formatMAD, formatDate } from '@/lib/utils';
import { Truck, Clock } from 'lucide-react';

const BID_STATUS_LABELS: Record<string, string> = {
  PENDING:   'En attente',
  ACCEPTED:  'Acceptée',
  REJECTED:  'Refusée',
  WITHDRAWN: 'Retirée',
};

const BID_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700',
  ACCEPTED:  'bg-green-50 text-green-700',
  REJECTED:  'bg-red-50 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

export default function CarrierBidsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mes offres" subtitle={`${mockBids.length} offres soumises`} />

      <div className="bg-white border border-brand-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg border-b border-brand-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Expédition</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Véhicule</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Prix</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Délai</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Statut</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Soumise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {mockBids.map((bid) => (
              <tr key={bid.id} className="hover:bg-brand-bg transition-colors">
                <td className="px-5 py-3 text-brand-navy font-medium">job-001</td>
                <td className="px-5 py-3 text-gray-600">
                  <span className="flex items-center gap-1"><Truck size={13} className="text-gray-400" />{bid.vehicleType}</span>
                </td>
                <td className="px-5 py-3 font-semibold text-brand-primary">{formatMAD(bid.priceMAD)}</td>
                <td className="px-5 py-3 text-gray-600">
                  <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" />{bid.etaDays}j</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium ${BID_STATUS_COLORS[bid.status]}`}>
                    {BID_STATUS_LABELS[bid.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400">{formatDate(bid.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
