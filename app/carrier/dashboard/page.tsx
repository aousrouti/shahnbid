import Link from 'next/link';
import KpiCard from '@/components/shared/KpiCard';
import JobCard from '@/components/jobs/JobCard';
import PageHeader from '@/components/shared/PageHeader';
import CarrierMapPanel from '@/components/carrier/CarrierMapPanel';
import NotificationsFeed from '@/components/shared/NotificationsFeed';
import { listJobs } from '@/lib/server/jobs-repo';
import { listBidsForCarrier } from '@/lib/server/bids-repo';
import { listReturnTrips } from '@/lib/server/returns-repo';
import { getCurrentUser } from '@/lib/auth/current-user';
import { mockApprovedCarrier } from '@/lib/mock-data/users';
import { formatMAD } from '@/lib/utils';
import { Search, FileText, RotateCcw, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CarrierDashboardPage() {
  const user = await getCurrentUser();
  const name = user?.fullName ?? mockApprovedCarrier.fullName;
  const company = user?.companyName ?? mockApprovedCarrier.companyName;

  const publishedJobs = await listJobs({ status: 'PUBLISHED' });
  const myBids    = user ? await listBidsForCarrier(user.id) : [];
  const myReturns = user ? await listReturnTrips({ carrierId: user.id }) : [];
  // Revenue = sum of this carrier's accepted bid prices.
  const revenue = myBids.filter((b) => b.status === 'ACCEPTED').reduce((s, b) => s + b.priceMAD, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${name} 👋`}
        subtitle={company}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Appels d'offres" value={publishedJobs.length} icon={Search} />
        <KpiCard label="Offres soumises" value={myBids.length}        icon={FileText} />
        <KpiCard label="Retours publiés" value={myReturns.length}     icon={RotateCcw} />
        <KpiCard label="Revenus (MAD)"   value={formatMAD(revenue)}   icon={DollarSign} />
      </div>

      <NotificationsFeed />

      <div className="rounded-card border border-brand-border bg-white p-4">
        <CarrierMapPanel variant="compact" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-navy">Nouvelles expéditions</h2>
          <Link href="/carrier/jobs" className="text-sm text-brand-primary hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {publishedJobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} variant="carrier" href={`/carrier/jobs/${job.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
