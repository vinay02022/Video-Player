import { useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVideoStore } from '@/store/useVideoStore';
import { PROGRESS_INTERVAL } from '@/lib/constants';

interface ProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
}

export function VideoPlayer() {
  const playerRef = useRef<ReactPlayer>(null);
  const readyRef = useRef(false);

  const currentVideo = usePlayerStore((s) => s.currentVideo);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const seekTarget = usePlayerStore((s) => s.seekTarget);
  const clearSeekTarget = usePlayerStore((s) => s.clearSeekTarget);
  const updateProgress = usePlayerStore((s) => s.updateProgress);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setIsBuffering = usePlayerStore((s) => s.setIsBuffering);
  const startAutoPlayCountdown = usePlayerStore((s) => s.startAutoPlayCountdown);
  const cacheDuration = useVideoStore((s) => s.cacheDuration);

  // Handle seek commands from store
  useEffect(() => {
    if (seekTarget !== null && playerRef.current) {
      playerRef.current.seekTo(seekTarget, 'seconds');
      clearSeekTarget();
    }
  }, [seekTarget, clearSeekTarget]);

  // Directly control YouTube player when isPlaying changes.
  // The `playing` prop alone doesn't work reliably for YouTube Shorts,
  // so we call the internal YouTube IFrame API directly.
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    try {
      const internal = playerRef.current.getInternalPlayer();
      if (!internal) return;
      if (isPlaying) {
        internal.playVideo?.();
      } else {
        internal.pauseVideo?.();
      }
    } catch {
      // Ignore — react-player will attempt via prop as fallback
    }
  }, [isPlaying]);

  const handleProgress = useCallback(
    (state: ProgressState) => {
      updateProgress(state.played, state.playedSeconds, state.loaded);
    },
    [updateProgress],
  );

  const handleDuration = useCallback(
    (dur: number) => {
      setDuration(dur);
      if (currentVideo) {
        cacheDuration(currentVideo.slug, dur);
      }
    },
    [setDuration, cacheDuration, currentVideo],
  );

  const handleEnded = useCallback(() => {
    setPlaying(false);
    startAutoPlayCountdown();
  }, [setPlaying, startAutoPlayCountdown]);

  const handleReady = useCallback(() => {
    readyRef.current = true;
    // Force play on initial load
    if (isPlaying && playerRef.current) {
      try {
        const internal = playerRef.current.getInternalPlayer();
        internal?.playVideo?.();
      } catch {
        // Silently ignore
      }
    }
  }, [isPlaying]);

  if (!currentVideo) return null;

  return (
    <div className="youtube-player-wrapper w-full h-full">
      <ReactPlayer
        ref={playerRef}
        url={currentVideo.mediaUrl}
        playing={isPlaying}
        controls={false}
        width="100%"
        height="100%"
        playsinline
        progressInterval={PROGRESS_INTERVAL}
        config={{
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            cc_load_policy: 0,
            showinfo: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
        }}
        onReady={handleReady}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onBuffer={() => setIsBuffering(true)}
        onBufferEnd={() => setIsBuffering(false)}
      />
    </div>
  );
}
