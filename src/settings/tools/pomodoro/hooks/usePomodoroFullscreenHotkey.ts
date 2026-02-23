import { useEffect } from 'react';

export const usePomodoroFullscreenHotkey = (
  isFullscreen: boolean,
  onExit: () => void
): void => {
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onExit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onExit]);
};
