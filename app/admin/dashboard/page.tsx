import KpiCard from '@/components/shared/KpiCard';
import PageHeader from '@/components/shared/PageHeader';
import AdminNotifications from '@/components/admin/AdminNotifications';
import EmailTester from '@/components/admin/EmailTester';
import WhatsAppTester from '@/components/admin/WhatsAppTester';
import { listJobs } from '@/lib/server/jobs-repo';
import { listCarriers } from '@/lib/demo-data/accounts';
import { getPricingSettings, commissionAmount } from '@/lib/pricing/store';
import { getCurrentUser } from '@/lib/auth/current-user';
import { formatMAD } from '@/lib/utils';
import { Users, Briefcase, DollarSign, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user            = await getCurrentUser();
  const pricing         = await getPricingSettings();
  const carriers        = await listCarriers();
  const jobs            = await listJobs();
  const completedJobs   = jobs.filter((j) => j.status === 'COMPLETED');
  const totalCommission = completedJobs.reduce((sum, j) => sum + commissionAmount(j.agreedPriceMAD ?? 0, pricing), 0);
  const pendingCarriers = carriers.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord Admin" subtitle="Vue d'ensemble de la plateforme" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Expéditions totales"     value={jobs.length}                 icon={Briefcase} />
        <KpiCard label="Transporteurs inscrits"  value={carriers.length}             icon={Users} />
        <KpiCard label="Approbations en attente" value={pendingCarriers}             icon={Clock} />
        <KpiCard label="Commission totale (MAD)" value={formatMAD(totalCommission)}  icon={DollarSign} />
      </div>

      <AdminNotifications />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmailTester defaultTo={user?.email ?? ''} />
        <WhatsAppTester defaultTo={user?.phone ?? ''} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Publiées',   count: jobs.filter((j) => j.status === 'PUBLISHED').length,  color: 'bg-blue-50 text-blue-700' },
          { label: 'Assignées',  count: jobs.filter((j) => j.status === 'ACCEPTED').length,   color: 'bg-amber-50 text-amber-700' },
          { label: 'Terminées',  count: jobs.filter((j) => ['DELIVERED', 'COMPLETED'].includes(j.status)).length, color: 'bg-emerald-50 text-emerald-700' },
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
