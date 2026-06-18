import AdminSidebar from '@/components/layout/AdminSidebar';
import TopBar from '@/components/layout/TopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName="Admin ShahnBid" role="Administrateur" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
