import AdminSidebar from '@/components/layout/AdminSidebar';
import TopBar from '@/components/layout/TopBar';
import { getCurrentUser } from '@/lib/auth/current-user';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName={user?.fullName ?? 'Admin ShahnBid'} role="Administrateur" notifScope="admin" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
