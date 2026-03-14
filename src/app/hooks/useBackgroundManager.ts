import { useEffect, useState } from 'react';
import type { AppSettings } from '@/types';
import { fetchBingWallpaper, fetchRandomWallpaper } from '@/services/storage';

export const useBackgroundManager = (settings: AppSettings, loaded: boolean): string => {
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const updateBackground = async () => {
      if (!loaded) return;

      let next = '';
      if (settings.bgType === 'custom' && settings.customBgUrl) {
        next = settings.customBgUrl;
      } else if (settings.bgType === 'random') {
        next = await fetchRandomWallpaper();
      } else {
        next = await fetchBingWallpaper();
      }

      if (isMounted) {
        setBackgroundImage(next);
      }
    };

    updateBackground();
    return () => {
      isMounted = false;
    };
  }, [loaded, settings.bgType, settings.customBgUrl]);

  return backgroundImage;
};
