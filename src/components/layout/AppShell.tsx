import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="min-h-dvh bg-surface-primary text-white">
      <Outlet />
    </div>
  );
}
