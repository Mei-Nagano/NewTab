import { useEffect, useRef } from 'react';

export const usePomodoroAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('sounds/bell.wav');
  }, []);

  const playRing = async (): Promise<void> => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (error) {
      console.error('Audio play failed:', error);
    }
  };

  return { playRing };
};
