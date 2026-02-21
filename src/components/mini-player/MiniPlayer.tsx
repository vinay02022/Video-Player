import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';

export function MiniPlayer() {
  const navigate = useNavigate();
  const playerMode = usePlayerStore((s) => s.playerMode);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const closePlayer = usePlayerStore((s) => s.closePlayer);
  const restorePlayer = usePlayerStore((s) => s.restorePlayer);

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

  return (
    <AnimatePresence>
      {playerMode === 'mini' && currentVideo && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-surface-secondary border-t border-white/10 safe-area-bottom"
          onClick={handleRestore}
        >
          {/* Progress indicator at top of mini player */}
          <MiniProgress />

          <div className="flex items-center h-16 px-3 gap-3">
            {/* Thumbnail */}
            <div className="w-20 h-11 flex-shrink-0 rounded-md overflow-hidden bg-surface-tertiary">
              <img
                src={currentVideo.thumbnailUrl}
                alt={currentVideo.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <p className="flex-1 text-sm text-white truncate font-medium">
              {currentVideo.title}
            </p>

            {/* Play/Pause */}
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

            {/* Close */}
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close player"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MiniProgress() {
  const played = usePlayerStore((s) => s.played);

  return (
    <div className="h-[2px] w-full bg-white/10">
      <div
        className="h-full bg-accent-red origin-left transition-transform duration-200"
        style={{ transform: `scaleX(${played})`, width: '100%' }}
      />
    </div>
  );
}
