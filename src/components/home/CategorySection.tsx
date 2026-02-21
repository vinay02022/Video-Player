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
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-6 px-5 sm:px-8 lg:px-10">
        <img
          src={category.iconUrl}
          alt=""
          className="w-10 h-10 rounded-lg"
          loading="lazy"
        />
        <h2 className="text-xl font-bold text-white">{category.name}</h2>
        <span className="text-sm text-gray-400 ml-auto">{videos.length} videos</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8 px-5 sm:px-8 lg:px-10">
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
