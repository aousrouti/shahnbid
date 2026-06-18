import KpiCard from '@/components/shared/KpiCard';
import PageHeader from '@/components/shared/PageHeader';
import AdminNotifications from '@/components/admin/AdminNotifications';
import { mockJobs } from '@/lib/mock-data/jobs';
import { mockAllCarriers } from '@/lib/mock-data/users';
import { Users, Briefcase, DollarSign, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const completedJobs   = mockJobs.filter((j) => j.status === 'COMPLETED');
  const totalCommission = completedJobs.reduce((sum, j) => sum + (j.agreedPriceMAD ?? 0) * 0.1, 0);
  const pendingCarriers = mockAllCarriers.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord Admin" subtitle="Vue d'ensemble de la plateforme" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Expéditions totales"     value={mockJobs.length}         icon={Briefcase} delta={12} deltaPositive />
        <KpiCard label="Transporteurs inscrits"  value={mockAllCarriers.length}  icon={Users} />
        <KpiCard label="Approbations en attente" value={pendingCarriers}         icon={Clock} />
        <KpiCard label="Commission totale (MAD)" value={`${totalCommission.toLocaleString('fr-MA')}`} icon={DollarSign} delta={20} deltaPositive />
      </div>

      <AdminNotifications />

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Publiées',   count: mockJobs.filter((j) => j.status === 'PUBLISHED').length,  color: 'bg-blue-50 text-blue-700' },
          { label: 'En transit', count: mockJobs.filter((j) => j.status === 'IN_TRANSIT').length, color: 'bg-amber-50 text-amber-700' },
          { label: 'Terminées',  count: mockJobs.filter((j) => j.status === 'COMPLETED').length,  color: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-card p-5 ${color} border border-current border-opacity-20`}>
            <div className="text-3xl font-extrabold">{count}</div>
            <div className="text-sm font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
