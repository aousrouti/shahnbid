import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import JobCard from '@/components/jobs/JobCard';
import EmptyState from '@/components/shared/EmptyState';
import { listJobs } from '@/lib/server/jobs-repo';
import { getCurrentUser } from '@/lib/auth/current-user';
import { Plus, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientJobsPage() {
  const user = await getCurrentUser();
  const jobs = user ? listJobs({ clientId: user.id }) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes expéditions"
        subtitle={`${jobs.length} expédition${jobs.length !== 1 ? 's' : ''}`}
        action={
          <Link href="/client/jobs/new" className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
            <Plus size={16} /> Nouvelle expédition
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          title="Aucune expédition"
          body="Vous n'avez pas encore publié d'expédition. Commencez maintenant !"
          action={
            <Link href="/client/jobs/new" className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
              Poster une expédition
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} variant="client" href={`/client/jobs/${job.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
