import { useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';
import { VideoPlayer } from './VideoPlayer';
import { PlayerControls } from './PlayerControls';

export function PlayerShell() {
  const playerMode = usePlayerStore((s) => s.playerMode);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const controlsVisible = usePlayerStore((s) => s.controlsVisible);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const setControlsVisible = usePlayerStore((s) => s.setControlsVisible);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTap = useCallback(() => {
    const nextVisible = !controlsVisible;
    setControlsVisible(nextVisible);

    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (nextVisible && isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, [controlsVisible, setControlsVisible, isPlaying]);

  if (playerMode !== 'full' || !currentVideo) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col">
      {/* Video area */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0">
        <VideoPlayer />

        {/* Transparent overlay to capture taps */}
        <div
          className="absolute inset-0 z-10"
          onClick={handleTap}
        />

        {/* Buffering indicator */}
        {isBuffering && (
          <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Controls overlay */}
        <AnimatePresence>
          {controlsVisible && <PlayerControls />}
        </AnimatePresence>
      </div>

      {/* Video info area below */}
      <div className="flex-1 overflow-y-auto bg-surface-primary px-4 py-4">
        <h2 className="text-base font-semibold text-white leading-snug">
          {currentVideo.title}
        </h2>
      </div>
    </div>
  );
}
