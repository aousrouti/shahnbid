import ClientSidebar from '@/components/layout/ClientSidebar';
import TopBar from '@/components/layout/TopBar';
import { mockClientProfile } from '@/lib/mock-data/users';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName={mockClientProfile.fullName} role="Chargeur" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
