import { create } from 'zustand';
import type { VideoItem, PlayerMode } from '@/types/video';
import { SKIP_SECONDS } from '@/lib/constants';

interface PlayerState {
  currentVideo: VideoItem | null;
  currentCategory: string | null;

  isPlaying: boolean;
  played: number;
  playedSeconds: number;
  loaded: number;
  duration: number;
  isSeeking: boolean;
  isBuffering: boolean;

  seekTarget: number | null;
  playerMode: PlayerMode;

  controlsVisible: boolean;
  videoListExpanded: boolean;

  autoPlayCountdownActive: boolean;
  autoPlaySecondsLeft: number;

  openVideo: (video: VideoItem, categorySlug: string) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  seekTo: (seconds: number) => void;
  clearSeekTarget: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  updateProgress: (played: number, playedSeconds: number, loaded: number) => void;
  setDuration: (duration: number) => void;
  setIsSeeking: (seeking: boolean) => void;
  setIsBuffering: (buffering: boolean) => void;
  minimizePlayer: () => void;
  enterPiP: () => void;
  restorePlayer: () => void;
  closePlayer: () => void;
  setControlsVisible: (visible: boolean) => void;
  toggleControls: () => void;
  setVideoListExpanded: (expanded: boolean) => void;
  startAutoPlayCountdown: () => void;
  cancelAutoPlayCountdown: () => void;
  tickAutoPlayCountdown: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentVideo: null,
  currentCategory: null,
  isPlaying: false,
  played: 0,
  playedSeconds: 0,
  loaded: 0,
  duration: 0,
  isSeeking: false,
  isBuffering: false,
  seekTarget: null,
  playerMode: 'idle',
  controlsVisible: true,
  videoListExpanded: false,
  autoPlayCountdownActive: false,
  autoPlaySecondsLeft: 2,

  openVideo: (video, categorySlug) =>
    set({
      currentVideo: video,
      currentCategory: categorySlug,
      isPlaying: true,
      played: 0,
      playedSeconds: 0,
      loaded: 0,
      duration: 0,
      seekTarget: null,
      playerMode: 'full',
      controlsVisible: true,
      videoListExpanded: false,
      autoPlayCountdownActive: false,
      autoPlaySecondsLeft: 2,
    }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),

  seekTo: (seconds) => set({ seekTarget: seconds, isSeeking: false }),
  clearSeekTarget: () => set({ seekTarget: null }),

  skipForward: () => {
    const { playedSeconds, duration } = get();
    set({ seekTarget: Math.min(playedSeconds + SKIP_SECONDS, duration) });
  },

  skipBackward: () => {
    const { playedSeconds } = get();
    set({ seekTarget: Math.max(playedSeconds - SKIP_SECONDS, 0) });
  },

  updateProgress: (played, playedSeconds, loaded) => {
    if (!get().isSeeking) {
      set({ played, playedSeconds, loaded });
    }
  },

  setDuration: (duration) => set({ duration }),
  setIsSeeking: (seeking) => set({ isSeeking: seeking }),
  setIsBuffering: (buffering) => set({ isBuffering: buffering }),

  minimizePlayer: () => set({ playerMode: 'mini', videoListExpanded: false }),
  enterPiP: () => set({ playerMode: 'pip', videoListExpanded: false }),
  restorePlayer: () => set({ playerMode: 'full' }),

  closePlayer: () =>
    set({
      currentVideo: null,
      currentCategory: null,
      isPlaying: false,
      playerMode: 'idle',
      played: 0,
      playedSeconds: 0,
      duration: 0,
      autoPlayCountdownActive: false,
    }),

  setControlsVisible: (visible) => set({ controlsVisible: visible }),
  toggleControls: () => set((s) => ({ controlsVisible: !s.controlsVisible })),
  setVideoListExpanded: (expanded) => set({ videoListExpanded: expanded }),

  startAutoPlayCountdown: () => set({ autoPlayCountdownActive: true, autoPlaySecondsLeft: 2 }),
  cancelAutoPlayCountdown: () => set({ autoPlayCountdownActive: false, autoPlaySecondsLeft: 2 }),
  tickAutoPlayCountdown: () => set((s) => ({ autoPlaySecondsLeft: s.autoPlaySecondsLeft - 1 })),
}));
