import Link from 'next/link';
import KpiCard from '@/components/shared/KpiCard';
import JobCard from '@/components/jobs/JobCard';
import PageHeader from '@/components/shared/PageHeader';
import { mockJobs } from '@/lib/mock-data/jobs';
import { mockApprovedCarrier } from '@/lib/mock-data/users';
import { Search, FileText, RotateCcw, DollarSign } from 'lucide-react';

export default function CarrierDashboardPage() {
  const publishedJobs = mockJobs.filter((j) => j.status === 'PUBLISHED').slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${mockApprovedCarrier.fullName} 👋`}
        subtitle={mockApprovedCarrier.companyName}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Appels d'offres"      value={mockJobs.filter((j) => j.status === 'PUBLISHED').length} icon={Search} />
        <KpiCard label="Offres soumises"      value={3}        icon={FileText} delta={50} deltaPositive />
        <KpiCard label="Retours publiés"      value={2}        icon={RotateCcw} />
        <KpiCard label="Revenus du mois (MAD)" value="12 500" icon={DollarSign} delta={8} deltaPositive />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-navy">Nouvelles expéditions</h2>
          <Link href="/carrier/jobs" className="text-sm text-brand-primary hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {publishedJobs.map((job) => (
            <JobCard key={job.id} job={job} variant="carrier" href={`/carrier/jobs/${job.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
