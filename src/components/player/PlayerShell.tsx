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
  const isHoveringRef = useRef(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { isSupported: isPiPSupported, openPiP } = useDocumentPiP();

  const playerMode = usePlayerStore((s) => s.playerMode);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const controlsVisible = usePlayerStore((s) => s.controlsVisible);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const played = usePlayerStore((s) => s.played);
  const playedSeconds = usePlayerStore((s) => s.playedSeconds);
  const isSeeking = usePlayerStore((s) => s.isSeeking);
  const setControlsVisible = usePlayerStore((s) => s.setControlsVisible);
  const minimizePlayer = usePlayerStore((s) => s.minimizePlayer);
  const enterPiP = usePlayerStore((s) => s.enterPiP);
  const restorePlayer = usePlayerStore((s) => s.restorePlayer);
  const closePlayer = usePlayerStore((s) => s.closePlayer);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isFull = playerMode === 'full';
  const isMini = playerMode === 'mini';
  const isPip = playerMode === 'pip';

  // Drag-to-minimize motion values
  const dragY = useMotionValue(0);
  const dragScale = useTransform(dragY, [0, 300], [1, 0.85]);
  const dragBorderRadius = useTransform(dragY, [0, 300], [0, 16]);
  const dragOpacity = useTransform(dragY, [0, 400], [1, 0.6]);

  /* ---- Hover-based controls (desktop) ---- */
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
  }, [setControlsVisible]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    if (!isSeeking) {
      setControlsVisible(false);
    }
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
  }, [setControlsVisible, isSeeking]);

  /* ---- Tap-based controls (mobile) ---- */
  const handleTap = useCallback(() => {
    if (isHoveringRef.current) return; // desktop hover handles it
    const nextVisible = !controlsVisible;
    setControlsVisible(nextVisible);

    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (nextVisible && isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        if (!isHoveringRef.current && !usePlayerStore.getState().isSeeking) {
          setControlsVisible(false);
        }
      }, 3000);
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

  const handleEnterPiP = useCallback(async () => {
    if (isPiPSupported && currentVideo) {
      const success = await openPiP(currentVideo.slug, playedSeconds);
      if (success) {
        // Document PiP opened — minimize to mini-player in the main tab
        minimizePlayer();
        navigate('/');
        return;
      }
    }
    // Fallback: in-app PiP
    enterPiP();
    navigate('/');
  }, [isPiPSupported, currentVideo, playedSeconds, openPiP, minimizePlayer, enterPiP, navigate]);

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

  // Outer container class per mode
  const outerClass = isFull
    ? 'fixed inset-0 z-40 bg-black flex flex-col overflow-hidden'
    : isPip
      ? 'fixed bottom-24 right-4 z-50 w-[480px] max-w-[90vw] rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10'
      : 'fixed bottom-0 left-0 right-0 z-50 bg-surface-secondary border-t border-white/10 safe-area-bottom';

  return (
    <motion.div
      className={outerClass}
      drag={isFull ? 'y' : false}
      dragConstraints={isFull ? { top: 0, bottom: 0 } : undefined}
      dragElastic={isFull ? { top: 0, bottom: 0.5 } : undefined}
      onDragEnd={isFull ? handleDragEnd : undefined}
      style={
        isFull
          ? { y: dragY, scale: dragScale, borderRadius: dragBorderRadius, opacity: dragOpacity }
          : undefined
      }
      initial={{ y: isPip ? 0 : '100%', opacity: isPip ? 0 : 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: isPip ? 0 : '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={isMini ? handleRestore : undefined}
    >
      {/* Top section: drag handle (full) / progress bar (mini) / hidden (pip) */}
      <div
        className={
          isFull
            ? 'flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing'
            : isPip
              ? 'hidden'
              : ''
        }
      >
        {isFull ? (
          <div className="w-10 h-1 rounded-full bg-gray-500/50" />
        ) : isMini ? (
          <div className="h-[2px] w-full bg-white/10">
            <div
              className="h-full bg-accent-red origin-left transition-transform duration-200"
              style={{ transform: `scaleX(${played})`, width: '100%' }}
            />
          </div>
        ) : null}
      </div>

      {/* Main content area */}
      <div
        className={
          isFull
            ? 'flex flex-col flex-1 min-h-0'
            : isPip
              ? ''
              : 'flex items-center h-16 px-3 gap-3'
        }
      >
        {/* Video container — always at this exact tree position */}
        <div
          className={
            isFull
              ? 'relative w-full aspect-video bg-black flex-shrink-0'
              : isPip
                ? 'relative w-full aspect-video bg-black'
                : 'w-[108px] h-[60px] flex-shrink-0 rounded-md overflow-hidden bg-surface-tertiary relative'
          }
          onMouseEnter={isFull ? handleMouseEnter : undefined}
          onMouseLeave={isFull ? handleMouseLeave : undefined}
        >
          <div className="w-full h-full">
            <VideoPlayer />
          </div>

          {/* Full mode: tap overlay (for mobile) */}
          {isFull && (
            <div className="absolute inset-0 z-10" onClick={handleTap} />
          )}

          {/* Full mode: buffering spinner */}
          {isFull && isBuffering && (
            <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Full mode: player controls (show on hover / tap) */}
          <AnimatePresence>
            {isFull && controlsVisible && (
              <PlayerControls onMinimize={handleMinimize} />
            )}
          </AnimatePresence>

          {/* Full mode: PiP button — ALWAYS visible, top-right */}
          {isFull && (
            <button
              onClick={(e) => { e.stopPropagation(); handleEnterPiP(); }}
              className="absolute top-3 right-3 z-[25] flex items-center justify-center w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Picture-in-Picture"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
              </svg>
            </button>
          )}

          {/* Full mode: auto-play countdown */}
          {isFull && <AutoPlayCountdown />}

          {/* PiP mode: overlay controls */}
          {isPip && (
            <>
              {/* Expand button — top left */}
              <button
                onClick={(e) => { e.stopPropagation(); handleRestore(); }}
                className="absolute top-2 left-2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                aria-label="Expand"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                  <path d="M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z" />
                </svg>
              </button>

              {/* Close button — top right */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>

              {/* Center play/pause — always visible */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <button
                  onClick={handleTogglePlay}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
                    {isPlaying ? (
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    ) : (
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Mini mode: transparent overlay to capture taps */}
          {isMini && <div className="absolute inset-0 z-10" />}
        </div>

        {/* Mini mode: title + controls */}
        {isMini && (
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
