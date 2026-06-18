import PageHeader from '@/components/shared/PageHeader';
import PostReturnTripForm from '@/components/returns/PostReturnTripForm';

export default function NewReturnTripPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Publier un retour disponible" subtitle="Proposez votre camion de retour à un prix fixe." />
      <PostReturnTripForm />
    </div>
  );
}
