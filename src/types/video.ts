export interface VideoItem {
  title: string;
  mediaUrl: string;
  mediaType: 'YOUTUBE';
  thumbnailUrl: string;
  slug: string;
}

export interface Category {
  slug: string;
  name: string;
  iconUrl: string;
}

export interface CategoryWithVideos {
  category: Category;
  contents: VideoItem[];
}

export interface VideoDataset {
  categories: CategoryWithVideos[];
}

export type PlayerMode = 'idle' | 'full' | 'mini';
