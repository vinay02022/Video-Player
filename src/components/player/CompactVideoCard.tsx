import { memo, useCallback } from 'react';
import type { VideoItem } from '@/types/video';
import { useVideoStore } from '@/store/useVideoStore';
import { formatTime } from '@/lib/formatTime';

interface CompactVideoCardProps {
  video: VideoItem;
  isActive: boolean;
  onSelect: () => void;
}

export const CompactVideoCard = memo(function CompactVideoCard({
  video,
  isActive,
  onSelect,
}: CompactVideoCardProps) {
  const duration = useVideoStore((s) => s.durationCache[video.slug]);

  const handleClick = useCallback(() => {
    if (!isActive) onSelect();
  }, [isActive, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`flex gap-3 w-full p-2 rounded-lg text-left transition-colors ${
        isActive ? 'bg-white/10' : 'hover:bg-white/5 active:bg-white/10'
      }`}
    >
      <div className="relative w-28 flex-shrink-0 aspect-video rounded-md overflow-hidden bg-surface-tertiary">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {duration != null && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-medium text-white px-1 py-0.5 rounded">
            {formatTime(duration)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <h4 className="text-sm font-medium text-white leading-snug line-clamp-2">
          {video.title}
        </h4>
        {isActive && (
          <span className="inline-block mt-1 text-[10px] font-semibold text-accent-red uppercase tracking-wide">
            Now Playing
          </span>
        )}
      </div>
    </button>
  );
});
