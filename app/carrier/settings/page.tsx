import PageHeader from '@/components/shared/PageHeader';
import NotificationPreferences from '@/components/shared/NotificationPreferences';
import { mockApprovedCarrier } from '@/lib/mock-data/users';

export default function CarrierSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Paramètres" subtitle="Vos informations et documents." />

      <div className="bg-white border border-brand-border rounded-card p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy">Informations du transporteur</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Nom complet',      value: mockApprovedCarrier.fullName },
            { label: 'Email',            value: mockApprovedCarrier.email },
            { label: 'Téléphone',        value: mockApprovedCarrier.phone },
            { label: 'Raison sociale',   value: mockApprovedCarrier.companyName },
            { label: 'Ville',            value: mockApprovedCarrier.city },
            { label: 'Numéro licence',   value: mockApprovedCarrier.licenseNumber },
            { label: 'Assurance exp.',   value: mockApprovedCarrier.insuranceExpiry },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-400">{label}</p>
              <p className="font-medium text-brand-navy">{value}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-brand-border flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium bg-green-50 text-green-700">
            Compte approuvé
          </span>
        </div>
      </div>

      <NotificationPreferences />
    </div>
  );
}
