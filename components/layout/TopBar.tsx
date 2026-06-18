import { Bell, ChevronDown } from 'lucide-react';

interface TopBarProps {
  userName: string;
  role: string;
}

export default function TopBar({ userName, role }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-brand-border flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative p-1.5 text-gray-500 hover:text-brand-primary transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-brand-navy">{userName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">{role}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
