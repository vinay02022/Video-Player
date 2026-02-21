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
import { useDocumentPiP } from '@/hooks/useDocumentPiP';
import { VideoPlayer } from './VideoPlayer';
import { PlayerControls } from './PlayerControls';
import { InPlayerVideoList } from './InPlayerVideoList';
import { AutoPlayCountdown } from './AutoPlayCountdown';
import { DRAG_THRESHOLD, DRAG_VELOCITY_THRESHOLD } from '@/lib/constants';

export function PlayerShell() {
  const navigate = useNavigate();
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const playerMode = usePlayerStore((s) => s.playerMode);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const controlsVisible = usePlayerStore((s) => s.controlsVisible);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const setControlsVisible = usePlayerStore((s) => s.setControlsVisible);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const minimizePlayer = usePlayerStore((s) => s.minimizePlayer);

  const { isPiP, isSupported: isPiPSupported, togglePiP } = useDocumentPiP();

  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Drag-to-minimize motion values
  const dragY = useMotionValue(0);
  const scale = useTransform(dragY, [0, 300], [1, 0.85]);
  const borderRadius = useTransform(dragY, [0, 300], [0, 16]);
  const bgOpacity = useTransform(dragY, [0, 400], [1, 0.6]);

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
    },
    [minimizePlayer, navigate],
  );

  const handleMinimize = useCallback(() => {
    minimizePlayer();
    navigate('/');
  }, [minimizePlayer, navigate]);

  const handlePiPToggle = useCallback(() => {
    if (videoContainerRef.current) {
      togglePiP(videoContainerRef.current);
    }
  }, [togglePiP]);

  if (playerMode !== 'full' || !currentVideo) return null;

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden"
      style={{ y: dragY, scale, borderRadius, opacity: bgOpacity }}
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
        {/* Video container (this element gets moved to PiP window) */}
        <div ref={videoContainerRef} className="w-full h-full">
          <VideoPlayer />
        </div>

        {/* Transparent overlay to capture taps */}
        {!isPiP && <div className="absolute inset-0 z-10" onClick={handleTap} />}

        {/* Buffering indicator */}
        {isBuffering && !isPiP && (
          <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Controls overlay */}
        <AnimatePresence>
          {controlsVisible && !isPiP && (
            <PlayerControls
              onMinimize={handleMinimize}
              onPiPToggle={isPiPSupported ? handlePiPToggle : undefined}
              isPiP={isPiP}
            />
          )}
        </AnimatePresence>

        {/* Auto-play countdown overlay */}
        {!isPiP && <AutoPlayCountdown />}

        {/* PiP active placeholder */}
        {isPiP && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-secondary gap-3">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-400 fill-current">
              <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
            </svg>
            <p className="text-sm text-gray-400">Playing in Picture-in-Picture</p>
            <button
              onClick={handlePiPToggle}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-full transition-colors"
            >
              Exit PiP
            </button>
          </div>
        )}
      </div>

      {/* Content area below video */}
      <div className="relative flex-1 overflow-hidden bg-surface-primary">
        <div className="px-4 py-4">
          <h2 className="text-base font-semibold text-white leading-snug">
            {currentVideo.title}
          </h2>
        </div>
        <InPlayerVideoList />
      </div>
    </motion.div>
  );
}
