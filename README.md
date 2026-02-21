# Video Player

A mobile-first video player application with a seamless user experience inspired by the YouTube mobile app. Built with smooth playback, gesture-based interactions, clean UI, and high performance.

**Live Demo:** [video-player-app-zeta.vercel.app](https://video-player-app-zeta.vercel.app)

## Features

### Core

- **Home Page - Video Feed:** Scrollable list of videos grouped by category with thumbnail, title, duration badge, and category label. Responsive grid layout (1/2/3 columns).
- **Full-Page Video Player:** Custom controls overlay with play/pause, skip +10/-10 seconds, seekable progress bar, and current/total time display. Auto-plays on open with controls auto-hide.
- **In-Player Video List:** Swipe-up bottom sheet showing related videos from the same category. Tap to switch playback instantly with auto-play.
- **Drag-to-Minimize:** Drag the player down to dock it as a persistent mini-player. Mini-player shows thumbnail, title, play/pause, and close. Tap to restore full-screen.

### Bonus

- **Auto-Play Next:** 2-second countdown with circular animation and cancel option when a video ends. Plays the next video in the same category.
- **PiP Support:** Browser Picture-in-Picture using the Document PiP API. Moves the video into a floating window that stays on top while multitasking. Supported in Chrome/Edge 116+.
- **Skip Button Animations:** Ripple effect and floating "+10"/"-10" text feedback on skip interactions.

## Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| Framework     | React 18 + TypeScript           |
| Build Tool    | Vite                            |
| Styling       | Tailwind CSS (mobile-first)     |
| Video         | react-player (YouTube)          |
| Animations    | framer-motion                   |
| State         | Zustand                         |
| Routing       | React Router v6                 |
| Utilities     | clsx + tailwind-merge           |

## Project Structure

```
src/
  components/
    home/           # HomePage, CategorySection, VideoCard
    player/         # PlayerShell, VideoPlayer, PlayerControls,
                    # ProgressBar, SkipButton, InPlayerVideoList,
                    # CompactVideoCard, AutoPlayCountdown, PlayerPage
    mini-player/    # MiniPlayer
    layout/         # AppShell, Header
  store/            # usePlayerStore, useVideoStore (Zustand)
  hooks/            # useAutoPlayNext, useDocumentPiP
  data/             # Static video dataset
  lib/              # Utilities (formatTime, cn, constants)
  types/            # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
git clone <repository-url>
cd video-player
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
npm run preview
```

## Architecture Highlights

- **PlayerShell outside routes:** The video player (ReactPlayer) is mounted in `AppShell` outside the route tree. This means navigating between home and player never destroys the iframe, enabling continuous playback during minimize/restore.
- **Two Zustand stores:** Player state (high-frequency progress updates) is separated from video catalog state (static data + duration cache) to prevent unnecessary re-renders.
- **GPU-accelerated animations:** All animations use `transform` and `opacity` for 60fps performance. The progress bar uses `scaleX` transforms instead of width changes.
- **Gesture handling:** framer-motion's drag and pan APIs handle drag-to-minimize and swipe-to-reveal interactions with spring physics.
