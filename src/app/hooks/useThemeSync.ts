import { useEffect } from 'react';
import type { Theme } from '@/types';

export const useThemeSync = (theme: Theme): void => {
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);
};
