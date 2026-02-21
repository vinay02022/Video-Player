import { useRef, useCallback, type MouseEvent, type TouchEvent } from 'react';

interface ProgressBarProps {
  played: number;
  loaded: number;
  duration: number;
  onSeek: (fraction: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
}

export function ProgressBar({
  played,
  loaded,
  duration,
  onSeek,
  onSeekStart,
  onSeekEnd,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getFraction = useCallback(
    (clientX: number) => {
      if (!barRef.current || duration === 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const fraction = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, fraction));
    },
    [duration],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      isDragging.current = true;
      onSeekStart();
      const fraction = getFraction(e.clientX);
      onSeek(fraction);

      const handleMouseMove = (ev: globalThis.MouseEvent) => {
        if (isDragging.current) {
          onSeek(getFraction(ev.clientX));
        }
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        onSeekEnd();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [getFraction, onSeek, onSeekStart, onSeekEnd],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      isDragging.current = true;
      onSeekStart();
      const touch = e.touches[0];
      if (touch) onSeek(getFraction(touch.clientX));
    },
    [getFraction, onSeek, onSeekStart],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging.current) {
        const touch = e.touches[0];
        if (touch) onSeek(getFraction(touch.clientX));
      }
    },
    [getFraction, onSeek],
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    onSeekEnd();
  }, [onSeekEnd]);

  return (
    <div
      ref={barRef}
      className="relative w-full h-6 flex items-center cursor-pointer touch-none group"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-1 group-hover:h-1.5 transition-all bg-white/20 rounded-full overflow-hidden">
        {/* Buffered */}
        <div
          className="absolute inset-y-0 left-0 bg-white/30 origin-left"
          style={{ transform: `scaleX(${loaded})`, width: '100%' }}
        />
        {/* Played */}
        <div
          className="absolute inset-y-0 left-0 bg-accent-red origin-left"
          style={{ transform: `scaleX(${played})`, width: '100%' }}
        />
      </div>

      {/* Thumb */}
      <div
        className="absolute w-3.5 h-3.5 bg-accent-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
        style={{ left: `${played * 100}%` }}
      />
    </div>
  );
}
