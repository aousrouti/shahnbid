import PageHeader from '@/components/shared/PageHeader';
import NotificationPreferences from '@/components/shared/NotificationPreferences';
import ProfileForm, { type ProfileData } from '@/components/shared/ProfileForm';
import CarrierStatusBanner from '@/components/carrier/CarrierStatusBanner';
import { getCurrentUser } from '@/lib/auth/current-user';
import { mockApprovedCarrier } from '@/lib/mock-data/users';

export const dynamic = 'force-dynamic';

export default async function CarrierSettingsPage() {
  const user = await getCurrentUser();
  const account: ProfileData = {
    role: 'CARRIER',
    email: user?.email ?? mockApprovedCarrier.email,
    fullName: user?.fullName ?? mockApprovedCarrier.fullName,
    phone: user?.phone,
    companyName: user?.companyName,
    country: user?.country,
    city: user?.city,
    licenseNumber: user?.licenseNumber,
    insuranceExpiry: user?.insuranceExpiry,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Paramètres" subtitle="Vos informations et documents." />
      <CarrierStatusBanner status={user?.status} />
      <ProfileForm account={account} />
      <NotificationPreferences />
    </div>
  );
}
