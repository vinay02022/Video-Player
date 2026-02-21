import { memo } from 'react';
import { VideoCard } from './VideoCard';
import type { Category, VideoItem } from '@/types/video';

interface CategorySectionProps {
  category: Category;
  videos: VideoItem[];
}

export const CategorySection = memo(function CategorySection({
  category,
  videos,
}: CategorySectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2.5 mb-4 px-4">
        <img
          src={category.iconUrl}
          alt=""
          className="w-7 h-7 rounded-md"
          loading="lazy"
        />
        <h2 className="text-base font-semibold text-white">{category.name}</h2>
        <span className="text-xs text-gray-400 ml-auto">{videos.length} videos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4">
        {videos.map((video) => (
          <VideoCard
            key={video.slug}
            video={video}
            categorySlug={category.slug}
            categoryName={category.name}
          />
        ))}
      </div>
    </section>
  );
});
