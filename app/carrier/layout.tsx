import CarrierSidebar from '@/components/layout/CarrierSidebar';
import TopBar from '@/components/layout/TopBar';
import { mockApprovedCarrier } from '@/lib/mock-data/users';

export default function CarrierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <CarrierSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName={mockApprovedCarrier.fullName} role="Transporteur" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
