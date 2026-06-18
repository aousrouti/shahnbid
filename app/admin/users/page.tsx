import PageHeader from '@/components/shared/PageHeader';
import { mockAllCarriers } from '@/lib/mock-data/users';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700',
  APPROVED:  'bg-green-50 text-green-700',
  REJECTED:  'bg-red-50 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'En attente',
  APPROVED:  'Approuvé',
  REJECTED:  'Refusé',
  SUSPENDED: 'Suspendu',
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transporteurs"
        subtitle={`${mockAllCarriers.length} dossiers enregistrés`}
      />

      <div className="bg-white border border-brand-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg border-b border-brand-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Entreprise</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Ville</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Licence</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Inscrit</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Statut</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {mockAllCarriers.map((carrier) => (
              <tr key={carrier.id} className="hover:bg-brand-bg transition-colors">
                <td className="px-5 py-3 font-medium text-brand-navy">{carrier.companyName}</td>
                <td className="px-5 py-3 text-gray-600">
                  <div>{carrier.fullName}</div>
                  <div className="text-xs text-gray-400">{carrier.email}</div>
                </td>
                <td className="px-5 py-3 text-gray-600">{carrier.city}</td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{carrier.licenseNumber}</td>
                <td className="px-5 py-3 text-gray-400">{formatDate(carrier.createdAt)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium ${STATUS_STYLES[carrier.status]}`}>
                    {STATUS_LABELS[carrier.status]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {carrier.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => console.log('Approuver (mock):', carrier.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-input hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle size={12} /> Approuver
                      </button>
                      <button
                        onClick={() => console.log('Refuser (mock):', carrier.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-input hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={12} /> Refuser
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
