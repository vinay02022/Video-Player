import { useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVideoStore } from '@/store/useVideoStore';

export function useAutoPlayNext() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const autoPlayCountdownActive = usePlayerStore((s) => s.autoPlayCountdownActive);
  const autoPlaySecondsLeft = usePlayerStore((s) => s.autoPlaySecondsLeft);
  const cancelAutoPlayCountdown = usePlayerStore((s) => s.cancelAutoPlayCountdown);
  const tickAutoPlayCountdown = usePlayerStore((s) => s.tickAutoPlayCountdown);
  const openVideo = usePlayerStore((s) => s.openVideo);
  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const currentCategory = usePlayerStore((s) => s.currentCategory);
  const categories = useVideoStore((s) => s.categories);

  const nextVideo = useMemo(() => {
    if (!currentCategory || !currentVideo) return null;
    const cat = categories.find((c) => c.category.slug === currentCategory);
    if (!cat) return null;
    const idx = cat.contents.findIndex((v) => v.slug === currentVideo.slug);
    if (idx === -1 || idx >= cat.contents.length - 1) return null;
    return cat.contents[idx + 1] ?? null;
  }, [categories, currentCategory, currentVideo]);

  const playNext = useCallback(() => {
    if (nextVideo && currentCategory) {
      cancelAutoPlayCountdown();
      openVideo(nextVideo, currentCategory);
      navigate(`/watch/${nextVideo.slug}`, { replace: true });
    }
  }, [nextVideo, currentCategory, cancelAutoPlayCountdown, openVideo, navigate]);

  useEffect(() => {
    if (!autoPlayCountdownActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const left = usePlayerStore.getState().autoPlaySecondsLeft;
      if (left <= 1) {
        playNext();
      } else {
        tickAutoPlayCountdown();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlayCountdownActive, playNext, tickAutoPlayCountdown]);

  return {
    nextVideo,
    autoPlayCountdownActive,
    autoPlaySecondsLeft,
    cancelAutoPlayCountdown,
  };
}
