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

  if (!currentVideo) return null;

  return (
    <div className="w-full h-full">
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
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            cc_load_policy: 0,
          },
        }}
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
