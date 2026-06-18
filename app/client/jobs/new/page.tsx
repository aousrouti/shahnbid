import PageHeader from '@/components/shared/PageHeader';
import PostJobForm from '@/components/jobs/PostJobForm';

export default function NewJobPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Publier une expédition" subtitle="Remplissez les informations ci-dessous pour recevoir des offres." />
      <PostJobForm />
    </div>
  );
}
