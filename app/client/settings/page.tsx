import PageHeader from '@/components/shared/PageHeader';
import NotificationPreferences from '@/components/shared/NotificationPreferences';
import ProfileForm, { type ProfileData } from '@/components/shared/ProfileForm';
import { getCurrentUser } from '@/lib/auth/current-user';
import { mockClientProfile } from '@/lib/mock-data/users';

export const dynamic = 'force-dynamic';

export default async function ClientSettingsPage() {
  const user = await getCurrentUser();
  const account: ProfileData = {
    role: 'CLIENT',
    email: user?.email ?? mockClientProfile.email,
    fullName: user?.fullName ?? mockClientProfile.fullName,
    phone: user?.phone,
    clientType: user?.clientType ?? mockClientProfile.clientType,
    companyName: user?.companyName,
    ice: user?.ice,
    address: user?.address,
    country: user?.country,
    city: user?.city,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Paramètres" subtitle="Vos informations personnelles et préférences." />
      <ProfileForm account={account} />
      <NotificationPreferences />
    </div>
  );
}
