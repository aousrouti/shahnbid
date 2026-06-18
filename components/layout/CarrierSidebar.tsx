'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, FileText, RotateCcw, Settings, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/carrier/dashboard', label: 'Tableau de bord',   icon: LayoutDashboard },
  { href: '/carrier/map',       label: 'Carte & trajets',    icon: Map },
  { href: '/carrier/jobs',      label: 'Appels d\'offres',   icon: Search },
  { href: '/carrier/bids',      label: 'Mes offres',         icon: FileText },
  { href: '/carrier/returns',   label: 'Mes retours',        icon: RotateCcw },
  { href: '/carrier/settings',  label: 'Paramètres',         icon: Settings },
];

export default function CarrierSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-brand-border min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-brand-border">
        <span className="text-xl font-bold text-brand-primary">ShahnBid</span>
        <span className="ml-2 text-xs text-gray-400 font-medium">Transporteur</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn('sidebar-link', pathname === href ? 'active' : '')}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
