import { cn } from '@/lib/utils';
import type { JobStatus } from '@/lib/types';

const STATUS_STYLES: Record<JobStatus, { bg: string; text: string; label: string }> = {
  DRAFT:      { bg: 'bg-gray-100',     text: 'text-gray-600',      label: 'Brouillon' },
  PUBLISHED:  { bg: 'bg-blue-50',      text: 'text-blue-700',      label: 'Ouvert aux offres' },
  ACCEPTED:   { bg: 'bg-blue-100',     text: 'text-blue-800',      label: 'Transporteur assigné' },
  PICKED_UP:  { bg: 'bg-amber-50',     text: 'text-amber-700',     label: 'Collecté' },
  IN_TRANSIT: { bg: 'bg-amber-100',    text: 'text-amber-800',     label: 'En transit' },
  DELIVERED:  { bg: 'bg-green-100',    text: 'text-green-800',     label: 'Livré' },
  COMPLETED:  { bg: 'bg-emerald-100',  text: 'text-emerald-900',   label: 'Terminé' },
  CANCELLED:  { bg: 'bg-gray-200',     text: 'text-gray-700',      label: 'Annulé' },
};

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bg, text, label } = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium', bg, text, className)}>
      {label}
    </span>
  );
}
