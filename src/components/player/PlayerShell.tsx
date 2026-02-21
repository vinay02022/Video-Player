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
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const played = usePlayerStore((s) => s.played);
  const setControlsVisible = usePlayerStore((s) => s.setControlsVisible);
  const minimizePlayer = usePlayerStore((s) => s.minimizePlayer);
  const restorePlayer = usePlayerStore((s) => s.restorePlayer);
  const closePlayer = usePlayerStore((s) => s.closePlayer);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isFull = playerMode === 'full';

  // Drag-to-minimize motion values
  const dragY = useMotionValue(0);
  const dragScale = useTransform(dragY, [0, 300], [1, 0.85]);
  const dragBorderRadius = useTransform(dragY, [0, 300], [0, 16]);
  const dragOpacity = useTransform(dragY, [0, 400], [1, 0.6]);

  const handleTap = useCallback(() => {
    const nextVisible = !controlsVisible;
    setControlsVisible(nextVisible);

    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (nextVisible && isPlaying) {
      controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, [controlsVisible, setControlsVisible, isPlaying]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > DRAG_THRESHOLD || info.velocity.y > DRAG_VELOCITY_THRESHOLD) {
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

  const handleRestore = useCallback(() => {
    if (currentVideo) {
      restorePlayer();
      navigate(`/watch/${currentVideo.slug}`);
    }
  }, [currentVideo, restorePlayer, navigate]);

  const handleTogglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      togglePlay();
    },
    [togglePlay],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      closePlayer();
      navigate('/');
    },
    [closePlayer, navigate],
  );

  if (!currentVideo) return null;

  return (
    <motion.div
      className={
        isFull
          ? 'fixed inset-0 z-40 bg-black flex flex-col overflow-hidden'
          : 'fixed bottom-0 left-0 right-0 z-50 bg-surface-secondary border-t border-white/10 safe-area-bottom'
      }
      drag={isFull ? 'y' : false}
      dragConstraints={isFull ? { top: 0, bottom: 0 } : undefined}
      dragElastic={isFull ? { top: 0, bottom: 0.5 } : undefined}
      onDragEnd={isFull ? handleDragEnd : undefined}
      style={
        isFull
          ? { y: dragY, scale: dragScale, borderRadius: dragBorderRadius, opacity: dragOpacity }
          : undefined
      }
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={!isFull ? handleRestore : undefined}
    >
      {/* Top section: drag handle (full) or progress bar (mini) */}
      <div
        className={
          isFull ? 'flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing' : ''
        }
      >
        {isFull ? (
          <div className="w-10 h-1 rounded-full bg-gray-500/50" />
        ) : (
          <div className="h-[2px] w-full bg-white/10">
            <div
              className="h-full bg-accent-red origin-left transition-transform duration-200"
              style={{ transform: `scaleX(${played})`, width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Main content area */}
      <div
        className={
          isFull
            ? 'flex flex-col flex-1 min-h-0'
            : 'flex items-center h-16 px-3 gap-3'
        }
      >
        {/* Video container — always at this exact tree position to prevent unmount */}
        <div
          className={
            isFull
              ? 'relative w-full aspect-video bg-black flex-shrink-0'
              : 'w-[108px] h-[60px] flex-shrink-0 rounded-md overflow-hidden bg-surface-tertiary relative'
          }
        >
          <div className="w-full h-full">
            <VideoPlayer />
          </div>

          {/* Full mode: tap overlay */}
          {isFull && (
            <div className="absolute inset-0 z-10" onClick={handleTap} />
          )}

          {/* Full mode: buffering spinner */}
          {isFull && isBuffering && (
            <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Full mode: player controls */}
          <AnimatePresence>
            {isFull && controlsVisible && (
              <PlayerControls onMinimize={handleMinimize} />
            )}
          </AnimatePresence>

          {/* Full mode: auto-play countdown */}
          {isFull && <AutoPlayCountdown />}

          {/* Mini mode: transparent overlay to capture taps */}
          {!isFull && <div className="absolute inset-0 z-10" />}
        </div>

        {/* Mini mode: title + controls */}
        {!isFull && (
          <>
            <p className="flex-1 text-sm text-white truncate font-medium">
              {currentVideo.title}
            </p>

            <button
              onClick={handleTogglePlay}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                {isPlaying ? (
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </button>

            <button
              onClick={handleClose}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close player"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </>
        )}

        {/* Full mode: content area below video */}
        {isFull && (
          <div className="relative flex-1 overflow-hidden bg-surface-primary">
            <div className="px-4 py-4">
              <h2 className="text-base font-semibold text-white leading-snug">
                {currentVideo.title}
              </h2>
            </div>
            <InPlayerVideoList />
          </div>
        )}
      </div>
    </motion.div>
  );
}
