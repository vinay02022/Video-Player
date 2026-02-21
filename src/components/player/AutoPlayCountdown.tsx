import { motion, AnimatePresence } from 'framer-motion';
import { useAutoPlayNext } from '@/hooks/useAutoPlayNext';
import { AUTOPLAY_DELAY } from '@/lib/constants';

const CIRCUMFERENCE = 2 * Math.PI * 28;

export function AutoPlayCountdown() {
  const {
    nextVideo,
    autoPlayCountdownActive,
    autoPlaySecondsLeft,
    cancelAutoPlayCountdown,
  } = useAutoPlayNext();

  return (
    <AnimatePresence>
      {autoPlayCountdownActive && nextVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-30 bg-black/75 flex flex-col items-center justify-center gap-5"
        >
          {/* Circular countdown */}
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#374151"
                strokeWidth="3"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: CIRCUMFERENCE }}
                transition={{ duration: AUTOPLAY_DELAY, ease: 'linear' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
              {autoPlaySecondsLeft}
            </span>
          </div>

          {/* Next video info */}
          <div className="text-center px-8">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Up Next</p>
            <p className="text-white text-sm font-medium leading-snug line-clamp-2">
              {nextVideo.title}
            </p>
          </div>

          {/* Cancel button */}
          <button
            onClick={cancelAutoPlayCountdown}
            className="px-5 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-full transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
