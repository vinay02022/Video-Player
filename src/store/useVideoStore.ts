import { create } from 'zustand';
import type { CategoryWithVideos } from '@/types/video';
import { videoDataset } from '@/data/videos';

interface VideoState {
  categories: CategoryWithVideos[];
  durationCache: Record<string, number>;
  cacheDuration: (slug: string, duration: number) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  categories: videoDataset.categories,
  durationCache: {},

  cacheDuration: (slug, duration) =>
    set((s) => ({
      durationCache: { ...s.durationCache, [slug]: duration },
    })),
}));
