import Link from 'next/link';
import KpiCard from '@/components/shared/KpiCard';
import JobCard from '@/components/jobs/JobCard';
import PageHeader from '@/components/shared/PageHeader';
import NotificationsFeed from '@/components/shared/NotificationsFeed';
import { listJobs } from '@/lib/server/jobs-repo';
import { getCurrentUser } from '@/lib/auth/current-user';
import { mockClientProfile } from '@/lib/mock-data/users';
import { CLIENT_TYPE_LABELS } from '@/lib/constants';
import { formatMAD } from '@/lib/utils';
import { Briefcase, Clock, CheckCircle, DollarSign, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  const user = await getCurrentUser();
  const myJobs = user ? await listJobs({ clientId: user.id }) : [];

  const publishedCount  = myJobs.filter((j) => j.status === 'PUBLISHED').length;
  const inProgressCount = myJobs.filter((j) => ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(j.status)).length;
  const completedCount  = myJobs.filter((j) => ['DELIVERED', 'COMPLETED'].includes(j.status)).length;
  // Total spent = sum of agreed prices on jobs that reached an agreement.
  const totalSpent = myJobs.reduce((s, j) => s + (j.agreedPriceMAD ?? 0), 0);

  const name = user?.fullName ?? mockClientProfile.fullName;
  const subtitle = user?.companyName ?? (user?.clientType ? CLIENT_TYPE_LABELS[user.clientType] : CLIENT_TYPE_LABELS.INDIVIDUAL);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${name} 👋`}
        subtitle={subtitle}
        action={
          <Link href="/client/jobs/new" className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
            <Plus size={16} /> Nouvelle expédition
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Expéditions actives" value={publishedCount}        icon={Briefcase} />
        <KpiCard label="En cours"            value={inProgressCount}       icon={Clock} />
        <KpiCard label="Terminées"           value={completedCount}        icon={CheckCircle} />
        <KpiCard label="Total dépensé (MAD)" value={formatMAD(totalSpent)} icon={DollarSign} />
      </div>

      <NotificationsFeed />

      {/* Recent jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-navy">Expéditions récentes</h2>
          <Link href="/client/jobs" className="text-sm text-brand-primary hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {myJobs.slice(0, 4).map((job) => (
            <JobCard key={job.id} job={job} variant="client" href={`/client/jobs/${job.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
