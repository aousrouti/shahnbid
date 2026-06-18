import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaPositive?: boolean;
  icon: LucideIcon;
}

export default function KpiCard({ label, value, delta, deltaPositive, icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-white border border-brand-border rounded-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-brand-navy">{value}</p>
          {delta !== undefined && (
            <p className={`flex items-center gap-1 text-xs font-medium ${deltaPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {deltaPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {deltaPositive ? '+' : ''}{delta}% ce mois
            </p>
          )}
        </div>
        <div className="p-2.5 bg-brand-light rounded-input">
          <Icon size={20} className="text-brand-primary" />
        </div>
      </div>
    </div>
  );
}
