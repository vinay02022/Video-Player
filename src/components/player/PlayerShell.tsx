import { useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { VideoPlayer } from './VideoPlayer';
import { PlayerControls } from './PlayerControls';
import { InPlayerVideoList } from './InPlayerVideoList';
import { AutoPlayCountdown } from './AutoPlayCountdown';
import { DRAG_THRESHOLD, DRAG_VELOCITY_THRESHOLD } from '@/lib/constants';

export function PlayerShell() {
  const navigate = useNavigate();

  const playerMode = usePlayerStore((s) => s.playerMode);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const controlsVisible = usePlayerStore((s) => s.controlsVisible);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const setControlsVisible = usePlayerStore((s) => s.setControlsVisible);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const minimizePlayer = usePlayerStore((s) => s.minimizePlayer);

  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Drag-to-minimize motion values
  const dragY = useMotionValue(0);
  const scale = useTransform(dragY, [0, 300], [1, 0.85]);
  const borderRadius = useTransform(dragY, [0, 300], [0, 16]);
  const opacity = useTransform(dragY, [0, 400], [1, 0.6]);

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

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const shouldMinimize =
        info.offset.y > DRAG_THRESHOLD || info.velocity.y > DRAG_VELOCITY_THRESHOLD;

      if (shouldMinimize) {
        minimizePlayer();
        navigate('/');
      }
      // If not minimized, framer-motion snaps back due to dragConstraints
    },
    [minimizePlayer, navigate],
  );

  const handleMinimize = useCallback(() => {
    minimizePlayer();
    navigate('/');
  }, [minimizePlayer, navigate]);

  if (playerMode !== 'full' || !currentVideo) return null;

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden"
      style={{ y: dragY, scale, borderRadius, opacity }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={handleDragEnd}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
        <div className="w-10 h-1 rounded-full bg-gray-500/50" />
      </div>

      {/* Video area */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0">
        <VideoPlayer />

        {/* Transparent overlay to capture taps */}
        <div className="absolute inset-0 z-10" onClick={handleTap} />

        {/* Buffering indicator */}
        {isBuffering && (
          <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Controls overlay */}
        <AnimatePresence>
          {controlsVisible && (
            <PlayerControls onMinimize={handleMinimize} />
          )}
        </AnimatePresence>

        {/* Auto-play countdown overlay */}
        <AutoPlayCountdown />
      </div>

      {/* Content area below video */}
      <div className="relative flex-1 overflow-hidden bg-surface-primary">
        {/* Video info */}
        <div className="px-4 py-4">
          <h2 className="text-base font-semibold text-white leading-snug">
            {currentVideo.title}
          </h2>
        </div>

        {/* In-player video list (bottom sheet) */}
        <InPlayerVideoList />
      </div>
    </motion.div>
  );
}
