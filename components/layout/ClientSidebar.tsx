'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PackagePlus, List, RotateCcw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/client/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/client/jobs/new',  label: 'Poster une expédition', icon: PackagePlus },
  { href: '/client/jobs',      label: 'Mes expéditions', icon: List },
  { href: '/client/returns',   label: 'Retours disponibles', icon: RotateCcw },
  { href: '/client/settings',  label: 'Paramètres', icon: Settings },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-brand-border min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-brand-border">
        <span className="text-xl font-bold text-brand-primary">ShahnBid</span>
        <span className="ml-2 text-xs text-gray-400 font-medium">Client</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'sidebar-link',
              pathname.startsWith(href) && href !== '/client/jobs' ? 'active' :
              pathname === href ? 'active' : '',
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
