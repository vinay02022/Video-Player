import { useMemo, useCallback, useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVideoStore } from '@/store/useVideoStore';
import { CompactVideoCard } from './CompactVideoCard';
import { useNavigate } from 'react-router-dom';

export function InPlayerVideoList() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const videoListExpanded = usePlayerStore((s) => s.videoListExpanded);
  const setVideoListExpanded = usePlayerStore((s) => s.setVideoListExpanded);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const currentCategory = usePlayerStore((s) => s.currentCategory);
  const openVideo = usePlayerStore((s) => s.openVideo);
  const categories = useVideoStore((s) => s.categories);

  const categoryVideos = useMemo(() => {
    const cat = categories.find((c) => c.category.slug === currentCategory);
    return cat?.contents ?? [];
  }, [categories, currentCategory]);

  const categoryName = useMemo(() => {
    const cat = categories.find((c) => c.category.slug === currentCategory);
    return cat?.category.name ?? '';
  }, [categories, currentCategory]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (videoListExpanded) {
        // Collapse if swiped down
        if (info.offset.y > 50 || info.velocity.y > 300) {
          setVideoListExpanded(false);
        }
      } else {
        // Expand if swiped up
        if (info.offset.y < -50 || info.velocity.y < -300) {
          setVideoListExpanded(true);
        }
      }
    },
    [videoListExpanded, setVideoListExpanded],
  );

  const handleVideoSelect = useCallback(
    (video: typeof categoryVideos[number]) => {
      if (currentCategory) {
        openVideo(video, currentCategory);
        navigate(`/watch/${video.slug}`, { replace: true });
        // Scroll list back to top
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [currentCategory, openVideo, navigate],
  );

  if (!currentVideo) return null;

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 bg-surface-secondary rounded-t-2xl z-30"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.1, bottom: 0.3 }}
      onDragEnd={handleDragEnd}
      animate={{
        height: videoListExpanded ? '65vh' : 72,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ touchAction: 'none' }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
        <div className="w-10 h-1 rounded-full bg-gray-500" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2">
        <h3 className="text-sm font-semibold text-white">
          {videoListExpanded ? categoryName : 'Up Next'}
        </h3>
        <span className="text-xs text-gray-400">
          {categoryVideos.length} videos
        </span>
      </div>

      {/* Scrollable video list */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-contain px-2 pb-4"
        style={{ height: videoListExpanded ? 'calc(65vh - 64px)' : 0 }}
      >
        {categoryVideos.map((video) => (
          <CompactVideoCard
            key={video.slug}
            video={video}
            isActive={video.slug === currentVideo.slug}
            onSelect={() => handleVideoSelect(video)}
          />
        ))}
      </div>
    </motion.div>
  );
}
