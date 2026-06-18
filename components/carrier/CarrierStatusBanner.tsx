import { Clock, XCircle, PauseCircle } from 'lucide-react';
import type { CarrierStatus } from '@/lib/types';

const CONFIG: Record<Exclude<CarrierStatus, 'APPROVED'>, { cls: string; title: string; body: string }> = {
  PENDING: {
    cls: 'bg-amber-50 border-amber-200 text-amber-800',
    title: 'Compte en attente d’approbation',
    body: 'Votre dossier est en cours d’examen. Vous pourrez soumettre des offres dès qu’un administrateur l’aura approuvé (sous 24h).',
  },
  REJECTED: {
    cls: 'bg-red-50 border-red-200 text-red-800',
    title: 'Dossier refusé',
    body: 'Votre inscription n’a pas été approuvée. Contactez le support pour plus d’informations.',
  },
  SUSPENDED: {
    cls: 'bg-gray-100 border-gray-300 text-gray-700',
    title: 'Compte suspendu',
    body: 'Votre compte est temporairement suspendu. Contactez le support.',
  },
};

export default function CarrierStatusBanner({ status }: { status?: CarrierStatus }) {
  if (!status || status === 'APPROVED') return null;
  const c = CONFIG[status];
  if (!c) return null;
  const Icon = status === 'REJECTED' ? XCircle : status === 'SUSPENDED' ? PauseCircle : Clock;

  return (
    <div className={`flex items-start gap-2 border-b px-6 py-2.5 text-sm ${c.cls}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold">{c.title}.</span> <span>{c.body}</span>
      </div>
    </div>
  );
}
