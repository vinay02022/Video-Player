import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVideoStore } from '@/store/useVideoStore';
import { formatTime } from '@/lib/formatTime';
import type { VideoItem } from '@/types/video';

interface VideoCardProps {
  video: VideoItem;
  categorySlug: string;
  categoryName: string;
}

export const VideoCard = memo(function VideoCard({
  video,
  categorySlug,
  categoryName,
}: VideoCardProps) {
  const navigate = useNavigate();
  const openVideo = usePlayerStore((s) => s.openVideo);
  const duration = useVideoStore((s) => s.durationCache[video.slug]);

  const handleClick = useCallback(() => {
    openVideo(video, categorySlug);
    navigate(`/watch/${video.slug}`);
  }, [video, categorySlug, openVideo, navigate]);

  return (
    <button
      onClick={handleClick}
      className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red rounded-xl"
    >
      <div className="relative aspect-[3/4] bg-surface-tertiary rounded-xl overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />

        {duration != null && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatTime(duration)}
          </span>
        )}

        <span className="absolute top-2 left-2 bg-white/15 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full">
          {categoryName}
        </span>
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-white leading-snug line-clamp-2 group-hover:text-white/90">
          {video.title}
        </h3>
      </div>
    </button>
  );
});
