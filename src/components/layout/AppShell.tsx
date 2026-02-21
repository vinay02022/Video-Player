import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';
import { PlayerShell } from '@/components/player/PlayerShell';

export function AppShell() {
  const playerMode = usePlayerStore((s) => s.playerMode);
  const currentVideo = usePlayerStore((s) => s.currentVideo);

  return (
    <div className="min-h-dvh bg-surface-primary text-white">
      <Outlet />

      <AnimatePresence>
        {playerMode !== 'idle' && currentVideo && <PlayerShell />}
      </AnimatePresence>
    </div>
  );
}
