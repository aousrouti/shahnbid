'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, DollarSign, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/users',      label: 'Transporteurs',   icon: Users },
  { href: '/admin/jobs',       label: 'Expéditions',     icon: Briefcase },
  { href: '/admin/commission', label: 'Commissions',     icon: DollarSign },
  { href: '/admin/pricing',    label: 'Tarification',    icon: SlidersHorizontal },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-brand-border min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-brand-border">
        <span className="text-xl font-bold text-brand-primary">ShahnBid</span>
        <span className="ml-2 text-xs text-gray-400 font-medium">Admin</span>
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
