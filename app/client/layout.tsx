import ClientSidebar from '@/components/layout/ClientSidebar';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/auth/current-user';
import { mockClientProfile } from '@/lib/mock-data/users';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName={user?.fullName ?? mockClientProfile.fullName} role="Chargeur" />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
