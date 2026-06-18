'use client';

import { formatMAD, formatDate } from '@/lib/utils';
import type { BidWithCarrier } from '@/lib/types';
import { Building2, Phone, Clock, Truck } from 'lucide-react';

const BID_STATUS_STYLES = {
  PENDING:   { bg: 'bg-yellow-50',   text: 'text-yellow-700',  label: 'En attente' },
  ACCEPTED:  { bg: 'bg-green-50',    text: 'text-green-700',   label: 'Acceptée' },
  REJECTED:  { bg: 'bg-red-50',      text: 'text-red-700',     label: 'Refusée' },
  WITHDRAWN: { bg: 'bg-gray-100',    text: 'text-gray-500',    label: 'Retirée' },
};

interface BidCardProps {
  bid: BidWithCarrier;
  isAccepted: boolean;
  onAccept: (bidId: string) => void;
  canAccept: boolean;
}

export default function BidCard({ bid, isAccepted, onAccept, canAccept }: BidCardProps) {
  const { bg, text, label } = BID_STATUS_STYLES[bid.status];

  return (
    <div className={`bg-white border rounded-card p-5 ${isAccepted ? 'border-green-400 ring-1 ring-green-300' : 'border-brand-border'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Carrier info */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-brand-navy">
            <Building2 size={15} className="text-brand-primary" />
            {bid.carrier.companyName}
            <span className="text-sm font-normal text-gray-500">· {bid.carrier.city}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Truck size={13} className="text-gray-400" />
              {bid.vehicleType}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-gray-400" />
              Délai : {bid.etaDays} jour{bid.etaDays !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={13} className="text-gray-400" />
              {bid.carrier.phone}
            </span>
          </div>
          {bid.notes && <p className="text-sm text-gray-500 italic">"{bid.notes}"</p>}
          <p className="text-xs text-gray-400">{formatDate(bid.createdAt)}</p>
        </div>

        {/* Price + status + action */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className="text-2xl font-bold text-brand-primary">{formatMAD(bid.priceMAD)}</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium ${bg} ${text}`}>
            {label}
          </span>
          {canAccept && bid.status === 'PENDING' && (
            <button
              onClick={() => onAccept(bid.id)}
              className="px-4 py-1.5 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors"
            >
              Accepter cette offre
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
