import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { findVideoBySlug } from '@/data/videos';

export function PlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const openVideo = usePlayerStore((s) => s.openVideo);
  const playerMode = usePlayerStore((s) => s.playerMode);

  // Handle direct URL access (deep link / page refresh)
  useEffect(() => {
    if (!currentVideo && slug) {
      const result = findVideoBySlug(slug);
      if (result) {
        openVideo(result.video, result.categorySlug);
      }
    }
  }, [slug, currentVideo, openVideo]);

  // Handle case where user navigates to /watch/:slug but player is minimized
  useEffect(() => {
    if (playerMode === 'mini' && slug && currentVideo?.slug === slug) {
      usePlayerStore.getState().restorePlayer();
    }
  }, [slug, playerMode, currentVideo?.slug]);

  // The actual player UI is rendered by PlayerShell in AppShell
  return null;
}
