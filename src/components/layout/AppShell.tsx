import { Outlet } from 'react-router-dom';
import { PlayerShell } from '@/components/player/PlayerShell';

export function AppShell() {
  return (
    <div className="min-h-dvh bg-surface-primary text-white">
      <Outlet />
      <PlayerShell />
    </div>
  );
}
