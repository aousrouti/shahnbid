import LogoutButton from './LogoutButton';
import NotificationBell from './NotificationBell';

interface TopBarProps {
  userName: string;
  role: string;
  notifScope?: 'user' | 'admin';
}

export default function TopBar({ userName, role, notifScope = 'user' }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-brand-border flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <NotificationBell scope={notifScope} />
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-brand-navy">{userName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">{role}</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
