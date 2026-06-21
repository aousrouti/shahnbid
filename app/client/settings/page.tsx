import PageHeader from '@/components/shared/PageHeader';
import NotificationPreferences from '@/components/shared/NotificationPreferences';
import { mockClientProfile } from '@/lib/mock-data/users';
import { CLIENT_TYPE_LABELS } from '@/lib/constants';

export default function ClientSettingsPage() {
  const isBusiness = mockClientProfile.clientType === 'BUSINESS';
  const fields = [
    { label: 'Type de compte', value: CLIENT_TYPE_LABELS[mockClientProfile.clientType] },
    { label: 'Nom complet',    value: mockClientProfile.fullName },
    { label: 'Email',          value: mockClientProfile.email },
    { label: 'Téléphone',      value: mockClientProfile.phone },
    ...(isBusiness ? [
      { label: 'Raison sociale', value: mockClientProfile.companyName },
      { label: 'ICE',            value: mockClientProfile.ice },
      { label: 'Adresse',        value: mockClientProfile.address },
    ] : []),
    { label: 'Ville',          value: mockClientProfile.city },
  ];
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Paramètres" subtitle="Vos informations personnelles et préférences." />

      <div className="bg-white border border-brand-border rounded-card p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy">Informations du compte</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-400">{label}</p>
              <p className="font-medium text-brand-navy">{value}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-brand-border">
          <button className="px-4 py-2 border border-brand-primary text-brand-primary text-sm font-semibold rounded-input hover:bg-brand-light transition-colors">
            Modifier le profil
          </button>
        </div>
      </div>

      <NotificationPreferences />
    </div>
  );
}
