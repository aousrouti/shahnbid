import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import PostJobForm from '@/components/jobs/PostJobForm';
import { getJobDetail, getJobOwner } from '@/lib/server/jobs-repo';
import { getCurrentUser } from '@/lib/auth/current-user';
import type { PostJobInput } from '@/lib/validations';
import type { CargoType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const d = (iso?: string) => (iso ? iso.slice(0, 10) : ''); // ISO → YYYY-MM-DD for date inputs

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const job = await getJobDetail(params.id);
  if (!job) notFound();
  // Only the owning client may edit, and only while still open.
  if (user?.role !== 'CLIENT' || (await getJobOwner(params.id)) !== user.id) notFound();
  if (job.status !== 'PUBLISHED') {
    return (
      <div className="space-y-4 max-w-2xl">
        <PageHeader title="Modification impossible" subtitle="Cette expédition n'est plus ouverte aux modifications." />
        <Link href={`/client/jobs/${params.id}`} className="text-sm text-brand-primary hover:underline">← Retour à l'expédition</Link>
      </div>
    );
  }

  const initial: Partial<PostJobInput> = {
    cargoType: job.cargoType as CargoType,
    description: job.description,
    weightKg: job.weightKg,
    fragile: job.fragile,
    hazmat: job.hazmat,
    originCity: job.originCity,
    originAddress: job.originAddress,
    destCity: job.destCity,
    destAddress: job.destAddress,
    pickupDateFrom: d(job.pickupDateFrom),
    pickupDateTo: d(job.pickupDateTo) || d(job.pickupDateFrom),
    deliveryDate: d(job.deliveryDate),
    notes: job.notes,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href={`/client/jobs/${params.id}`} className="text-sm text-brand-primary hover:underline">← Retour à l'expédition</Link>
      <PageHeader title="Modifier l'expédition" subtitle="Mettez à jour les détails. Les transporteurs verront la version à jour." />
      <PostJobForm jobId={params.id} initial={initial} initialPhotos={job.photoUrls} />
    </div>
  );
}
