'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BidCard from '@/components/bids/BidCard';
import EmptyState from '@/components/shared/EmptyState';
import type { BidWithCarrier } from '@/lib/types';

interface JobBidsListProps {
  bids: BidWithCarrier[];
  acceptedBidId?: string;
  canAct: boolean; // true when the job is still open (PUBLISHED)
}

export default function JobBidsList({ bids, acceptedBidId, canAct }: JobBidsListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(bidId: string, action: 'ACCEPT' | 'REJECT') {
    setBusyId(bidId);
    setError(null);
    try {
      const res = await fetch(`/api/bids/${bidId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Action impossible. Réessayez.');
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="font-semibold text-brand-navy mb-4">Offres reçues ({bids.length})</h2>

      {error && (
        <div className="mb-3 border border-red-200 bg-red-50 text-red-700 rounded-input px-4 py-3 text-sm">{error}</div>
      )}

      {bids.length === 0 ? (
        <EmptyState
          title="Aucune offre pour le moment"
          body="Les transporteurs approuvés peuvent soumettre des offres sur cette expédition."
        />
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <BidCard
              key={bid.id}
              bid={bid}
              isAccepted={bid.id === acceptedBidId}
              canAccept={canAct}
              busy={busyId === bid.id}
              onAccept={(id) => act(id, 'ACCEPT')}
              onReject={(id) => act(id, 'REJECT')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
