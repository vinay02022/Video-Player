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
  const [isPiP, setIsPiP] = useState(false);
  const pipWindowRef = useRef<Window | null>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);
  const playerElementRef = useRef<HTMLElement | null>(null);

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  const enterPiP = useCallback(
    async (playerContainer: HTMLElement) => {
      if (!isSupported || !window.documentPictureInPicture) return;
      if (isPiP) return;

      try {
        // Remember original parent so we can move the element back
        originalParentRef.current = playerContainer.parentElement;
        playerElementRef.current = playerContainer;

        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 480,
          height: 270,
        });

        pipWindowRef.current = pipWindow;

        // Copy all stylesheets to the PiP window
        const allStyles = [...document.styleSheets];
        for (const sheet of allStyles) {
          try {
            if (sheet.href) {
              const link = pipWindow.document.createElement('link');
              link.rel = 'stylesheet';
              link.href = sheet.href;
              pipWindow.document.head.appendChild(link);
            } else if (sheet.cssRules) {
              const style = pipWindow.document.createElement('style');
              const rules = [...sheet.cssRules].map((r) => r.cssText).join('\n');
              style.textContent = rules;
              pipWindow.document.head.appendChild(style);
            }
          } catch {
            // Skip inaccessible stylesheets (CORS)
          }
        }

        // Add PiP-specific styles that force the video to fill the window
        const pipStyle = pipWindow.document.createElement('style');
        pipStyle.textContent = `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #000;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
          }
          .pip-container {
            width: 100vw;
            height: 100vh;
            background: #000;
          }
          .pip-container > * {
            width: 100% !important;
            height: 100% !important;
          }
          .pip-container div,
          .pip-container iframe {
            width: 100% !important;
            height: 100% !important;
          }
        `;
        pipWindow.document.head.appendChild(pipStyle);

        // Create wrapper and MOVE (not clone) the player element
        const wrapper = pipWindow.document.createElement('div');
        wrapper.className = 'pip-container';
        pipWindow.document.body.appendChild(wrapper);
        wrapper.appendChild(playerContainer);

        setIsPiP(true);

        // When PiP window closes, move element back
        pipWindow.addEventListener('pagehide', () => {
          if (originalParentRef.current && playerElementRef.current) {
            originalParentRef.current.prepend(playerElementRef.current);
          }
          pipWindowRef.current = null;
          setIsPiP(false);
        });
      } catch (err) {
        console.error('Failed to enter PiP:', err);
      }
    },
    [isSupported, isPiP],
  );

  const exitPiP = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
    }
  }, []);

  const togglePiP = useCallback(
    (playerContainer: HTMLElement) => {
      if (isPiP) {
        exitPiP();
      } else {
        enterPiP(playerContainer);
      }
    },
    [isPiP, enterPiP, exitPiP],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  return { isPiP, isSupported, togglePiP, exitPiP };
}
