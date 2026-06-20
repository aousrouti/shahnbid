import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import KpiCard from '@/components/shared/KpiCard';
import { listJobs } from '@/lib/server/jobs-repo';
import { formatDate, formatMAD } from '@/lib/utils';
import { getPricingSettings, commissionBreakdown } from '@/lib/pricing/store';
import { DollarSign, MapPin, Receipt, SlidersHorizontal } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCommissionPage() {
  const pricing = await getPricingSettings();
  const completedJobs = (await listJobs({ status: 'COMPLETED' })).filter((j) => j.agreedPriceMAD);
  // Use the rate snapshotted at acceptance per job, so past pricing changes don't rewrite history.
  const rows = completedJobs.map((j) => ({
    job: j,
    b: commissionBreakdown(j.agreedPriceMAD!, { ...pricing, commissionRate: j.commissionRateSnap ?? pricing.commissionRate }),
  }));

  const totalCommission = rows.reduce((s, r) => s + r.b.commissionMAD, 0);
  const totalVat        = rows.reduce((s, r) => s + r.b.vatMAD, 0);
  const totalFee        = totalCommission + totalVat;
  const ratePct = +(pricing.commissionRate * 100).toFixed(2);
  const vatPct  = +(pricing.vatRate * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader title="Journal des commissions" subtitle={`Taux : ${ratePct}% + ${vatPct}% TVA sur chaque expédition terminée`} />

      <div className="flex items-center justify-between rounded-card border border-brand-border bg-brand-bg px-4 py-3 text-sm">
        <span className="text-gray-600">
          Commission <span className="font-semibold text-brand-navy">{ratePct}%</span> · plancher{' '}
          <span className="font-semibold text-brand-navy">{formatMAD(pricing.minCommissionMAD)}</span> · TVA{' '}
          <span className="font-semibold text-brand-navy">{vatPct}%</span>
        </span>
        <Link href="/admin/pricing" className="inline-flex items-center gap-1 text-brand-primary hover:underline font-medium">
          <SlidersHorizontal size={14} /> Modifier la tarification
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Expéditions terminées" value={completedJobs.length}        icon={DollarSign} />
        <KpiCard label="Commission (hors TVA)"  value={formatMAD(totalCommission)}  icon={DollarSign} delta={15} deltaPositive />
        <KpiCard label="TVA collectée"          value={formatMAD(totalVat)}         icon={Receipt} />
      </div>

      <div className="bg-white border border-brand-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg border-b border-brand-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Expédition</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Date de fin</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Prix convenu</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Commission ({ratePct}%)</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">TVA</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Frais total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {rows.map(({ job, b }) => (
              <tr key={job.id} className="hover:bg-brand-bg transition-colors">
                <td className="px-5 py-3 font-medium text-brand-navy">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-brand-primary" />
                    {job.originCity} → {job.destCity}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{formatDate(job.deliveryDate)}</td>
                <td className="px-5 py-3 text-right text-gray-700">{formatMAD(b.agreedPriceMAD)}</td>
                <td className="px-5 py-3 text-right font-semibold text-brand-primary">{formatMAD(b.commissionMAD)}</td>
                <td className="px-5 py-3 text-right text-gray-600">{formatMAD(b.vatMAD)}</td>
                <td className="px-5 py-3 text-right font-bold text-brand-navy">{formatMAD(b.totalFeeMAD)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-brand-border bg-brand-bg">
            <tr>
              <td colSpan={3} className="px-5 py-3 font-bold text-brand-navy text-right">Totaux</td>
              <td className="px-5 py-3 text-right font-bold text-brand-primary">{formatMAD(totalCommission)}</td>
              <td className="px-5 py-3 text-right font-bold text-gray-700">{formatMAD(totalVat)}</td>
              <td className="px-5 py-3 text-right font-extrabold text-brand-navy text-base">{formatMAD(totalFee)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
