import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';
import { PlayerShell } from '@/components/player/PlayerShell';
import { MiniPlayer } from '@/components/mini-player/MiniPlayer';

export function AppShell() {
  const playerMode = usePlayerStore((s) => s.playerMode);

  return (
    <div className="min-h-dvh bg-surface-primary text-white">
      <Outlet />

      <AnimatePresence>
        {playerMode === 'full' && <PlayerShell />}
      </AnimatePresence>

      <MiniPlayer />
    </div>
  );
}
