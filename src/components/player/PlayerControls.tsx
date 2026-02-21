import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ProgressBar } from './ProgressBar';
import { SkipButton } from './SkipButton';
import { formatTime } from '@/lib/formatTime';

interface PlayerControlsProps {
  onMinimize?: () => void;
}

export function PlayerControls({ onMinimize }: PlayerControlsProps) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const played = usePlayerStore((s) => s.played);
  const loaded = usePlayerStore((s) => s.loaded);
  const duration = usePlayerStore((s) => s.duration);
  const playedSeconds = usePlayerStore((s) => s.playedSeconds);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setIsSeeking = usePlayerStore((s) => s.setIsSeeking);

  const handleSeek = useCallback(
    (fraction: number) => {
      seekTo(fraction * duration);
    },
    [seekTo, duration],
  );

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, [setIsSeeking]);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
  }, [setIsSeeking]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex flex-col bg-gradient-to-b from-black/40 via-transparent to-black/60"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top bar with minimize button */}
      <div className="flex items-center px-3 pt-2">
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Minimize player"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </button>
        )}
      </div>

      {/* Spacer pushes controls to ~60% down */}
      <div className="flex-[3]" />

      {/* Play/pause + skip controls — between center and bottom */}
      <div className="flex items-center justify-center gap-10">
        <SkipButton direction="backward" />

        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-white fill-current">
            {isPlaying ? (
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
        </button>

        <SkipButton direction="forward" />
      </div>

      {/* Spacer between controls and progress */}
      <div className="flex-[2]" />

      {/* Progress bar at bottom */}
      <div className="px-4 pb-3">
        <ProgressBar
          played={played}
          loaded={loaded}
          duration={duration}
          onSeek={handleSeek}
          onSeekStart={handleSeekStart}
          onSeekEnd={handleSeekEnd}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-300">
          <span>{formatTime(playedSeconds)}</span>
          <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>
    </motion.div>
  );
}
