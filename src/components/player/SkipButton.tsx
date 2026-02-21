import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';

interface SkipButtonProps {
  direction: 'forward' | 'backward';
}

export function SkipButton({ direction }: SkipButtonProps) {
  const [rippleKey, setRippleKey] = useState(0);
  const skipForward = usePlayerStore((s) => s.skipForward);
  const skipBackward = usePlayerStore((s) => s.skipBackward);

  const handleClick = useCallback(() => {
    if (direction === 'forward') {
      skipForward();
    } else {
      skipBackward();
    }
    setRippleKey((k) => k + 1);
  }, [direction, skipForward, skipBackward]);

  const isForward = direction === 'forward';

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/10 transition-colors"
      aria-label={isForward ? 'Skip forward 10 seconds' : 'Skip backward 10 seconds'}
    >
      {/* Ripple animation */}
      <AnimatePresence>
        {rippleKey > 0 && (
          <motion.div
            key={rippleKey}
            initial={{ scale: 0.5, opacity: 0.4 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-white/20"
          />
        )}
      </AnimatePresence>

      {/* Floating text */}
      <AnimatePresence>
        {rippleKey > 0 && (
          <motion.span
            key={`text-${rippleKey}`}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-1 text-[10px] font-bold text-white pointer-events-none"
          >
            {isForward ? '+10' : '-10'}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Icon */}
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
        {isForward ? (
          <>
            <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z" />
            <text x="10" y="15.5" fontSize="7" fontWeight="700" textAnchor="middle" fill="currentColor">10</text>
          </>
        ) : (
          <>
            <path d="M6 13c0 3.31 2.69 6 6 6s6-2.69 6-6-2.69-6-6-6v4l-5-5 5-5v4c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8h2z" />
            <text x="14" y="15.5" fontSize="7" fontWeight="700" textAnchor="middle" fill="currentColor">10</text>
          </>
        )}
      </svg>
    </button>
  );
}
