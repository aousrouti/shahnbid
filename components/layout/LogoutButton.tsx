'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      title="Se déconnecter"
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-primary transition-colors"
    >
      <LogOut size={16} /> <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
