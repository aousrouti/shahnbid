import Link from 'next/link';
import KpiCard from '@/components/shared/KpiCard';
import JobCard from '@/components/jobs/JobCard';
import PageHeader from '@/components/shared/PageHeader';
import { mockJobs } from '@/lib/mock-data/jobs';
import { mockClientProfile } from '@/lib/mock-data/users';
import { Briefcase, Clock, CheckCircle, DollarSign, Plus } from 'lucide-react';

export default function ClientDashboardPage() {
  const recentJobs = mockJobs.slice(0, 4);
  const publishedCount = mockJobs.filter((j) => j.status === 'PUBLISHED').length;
  const inProgressCount = mockJobs.filter((j) => ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(j.status)).length;
  const completedCount = mockJobs.filter((j) => j.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${mockClientProfile.fullName} 👋`}
        subtitle={mockClientProfile.companyName}
        action={
          <Link href="/client/jobs/new" className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
            <Plus size={16} /> Nouvelle expédition
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Expéditions actives"  value={publishedCount}  icon={Briefcase} delta={20} deltaPositive />
        <KpiCard label="En cours"             value={inProgressCount} icon={Clock} />
        <KpiCard label="Terminées"            value={completedCount}  icon={CheckCircle} delta={15} deltaPositive />
        <KpiCard label="Total dépensé (MAD)"  value="15 500"          icon={DollarSign} />
      </div>

      {/* Recent jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-navy">Expéditions récentes</h2>
          <Link href="/client/jobs" className="text-sm text-brand-primary hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} variant="client" href={`/client/jobs/${job.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
