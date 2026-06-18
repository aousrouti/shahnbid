import CarrierSidebar from '@/components/layout/CarrierSidebar';
import TopBar from '@/components/layout/TopBar';
import { LocationProvider } from '@/components/carrier/LocationProvider';
import LocationStatusBar from '@/components/carrier/LocationStatusBar';
import CarrierStatusBanner from '@/components/carrier/CarrierStatusBanner';
import { getCurrentUser } from '@/lib/auth/current-user';
import { mockApprovedCarrier } from '@/lib/mock-data/users';

export default async function CarrierLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <LocationProvider>
      <div className="flex min-h-screen bg-brand-bg">
        <CarrierSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar userName={user?.fullName ?? mockApprovedCarrier.fullName} role="Transporteur" />
          <CarrierStatusBanner status={user?.status} />
          <LocationStatusBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </LocationProvider>
  );
}
