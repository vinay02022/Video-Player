import { useState, useCallback, useRef, useEffect } from 'react';

// Extend window type for Document PiP API
declare global {
  interface DocumentPictureInPicture {
    requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
    window: Window | null;
  }
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export function useDocumentPiP() {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const pipWindowRef = useRef<Window | null>(null);

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Opens a Document PiP window with a FRESH YouTube iframe.
  // This avoids Error 153 (we don't move the existing iframe).
  const openPiP = useCallback(
    async (videoId: string, startSeconds: number) => {
      if (!isSupported || !window.documentPictureInPicture) return false;
      if (isWindowOpen) return false;

      try {
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 640,
          height: 360,
        });

        pipWindowRef.current = pipWindow;

        // Style the PiP window
        const style = pipWindow.document.createElement('style');
        style.textContent = `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; overflow: hidden; width: 100vw; height: 100vh; }
          iframe { width: 100vw; height: 100vh; border: none; }
        `;
        pipWindow.document.head.appendChild(style);

        // Create a new YouTube embed iframe at the current time
        const iframe = pipWindow.document.createElement('iframe');
        const start = Math.floor(startSeconds);
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${start}&controls=1&modestbranding=1&rel=0&playsinline=1`;
        iframe.allow = 'autoplay; encrypted-media';
        pipWindow.document.body.appendChild(iframe);

        setIsWindowOpen(true);

        pipWindow.addEventListener('pagehide', () => {
          pipWindowRef.current = null;
          setIsWindowOpen(false);
        });

        return true;
      } catch (err) {
        console.error('Failed to open PiP:', err);
        return false;
      }
    },
    [isSupported, isWindowOpen],
  );

  const closePiP = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  return { isSupported, isWindowOpen, openPiP, closePiP };
}
