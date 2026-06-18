import PageHeader from '@/components/shared/PageHeader';
import KpiCard from '@/components/shared/KpiCard';
import { mockJobs } from '@/lib/mock-data/jobs';
import { formatDate, formatMAD, computeCommission } from '@/lib/utils';
import { DollarSign, MapPin } from 'lucide-react';
import { COMMISSION_RATE } from '@/lib/constants';

export default function AdminCommissionPage() {
  const completedJobs = mockJobs.filter((j) => j.status === 'COMPLETED' && j.agreedPriceMAD);
  const totalCommission = completedJobs.reduce((sum, j) => sum + computeCommission(j.agreedPriceMAD!), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Journal des commissions" subtitle={`Taux : ${COMMISSION_RATE * 100}% sur chaque expédition terminée`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Expéditions terminées" value={completedJobs.length}   icon={DollarSign} />
        <KpiCard label="Commission totale"     value={formatMAD(totalCommission)} icon={DollarSign} delta={15} deltaPositive />
        <KpiCard label="Commission ce mois"    value={formatMAD(totalCommission)} icon={DollarSign} />
      </div>

      <div className="bg-white border border-brand-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg border-b border-brand-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Expédition</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Date de fin</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Prix convenu</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Commission (10%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {completedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-brand-bg transition-colors">
                <td className="px-5 py-3 font-medium text-brand-navy">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-brand-primary" />
                    {job.originCity} → {job.destCity}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{formatDate(job.deliveryDate)}</td>
                <td className="px-5 py-3 text-right text-gray-700">{formatMAD(job.agreedPriceMAD!)}</td>
                <td className="px-5 py-3 text-right font-bold text-brand-primary">{formatMAD(computeCommission(job.agreedPriceMAD!))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-brand-border bg-brand-bg">
            <tr>
              <td colSpan={3} className="px-5 py-3 font-bold text-brand-navy text-right">Total commission</td>
              <td className="px-5 py-3 text-right font-extrabold text-brand-primary text-base">{formatMAD(totalCommission)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
