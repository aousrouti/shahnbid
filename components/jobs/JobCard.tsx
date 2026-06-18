'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { formatDate, formatWeight, formatMAD } from '@/lib/utils';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import type { JobSummary } from '@/lib/types';
import { MapPin, Package, Calendar, Users } from 'lucide-react';

interface JobCardProps {
  job: JobSummary;
  variant: 'client' | 'carrier';
  href: string;
}

export default function JobCard({ job, variant, href }: JobCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white border border-brand-border rounded-card p-5 hover:shadow-md hover:border-brand-mid transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={job.status} />
            {job.source === 'RETURN_TRIP' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium bg-teal-50 text-teal-700">
                Retour disponible
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(job.createdAt)}</span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={15} className="text-brand-primary shrink-0" />
          <span className="font-semibold text-brand-navy">{job.originCity}</span>
          <span className="text-gray-400">→</span>
          <span className="font-semibold text-brand-navy">{job.destCity}</span>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Package size={14} className="text-gray-400" />
            {CARGO_TYPE_LABELS[job.cargoType]} · {formatWeight(job.weightKg)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            {formatDate(job.pickupDateFrom)}
          </span>
          {variant === 'carrier' && (
            <span className="flex items-center gap-1">
              <Users size={14} className="text-gray-400" />
              {job.bidCount} offre{job.bidCount !== 1 ? 's' : ''}
            </span>
          )}
          {variant === 'client' && job.agreedPriceMAD && (
            <span className="font-semibold text-brand-primary">{formatMAD(job.agreedPriceMAD)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
