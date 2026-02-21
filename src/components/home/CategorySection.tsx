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
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5 px-4 sm:px-6 lg:px-8">
        <img
          src={category.iconUrl}
          alt=""
          className="w-9 h-9 rounded-lg"
          loading="lazy"
        />
        <h2 className="text-lg font-bold text-white">{category.name}</h2>
        <span className="text-sm text-gray-400 ml-auto">{videos.length} videos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 px-4 sm:px-6 lg:px-8">
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
