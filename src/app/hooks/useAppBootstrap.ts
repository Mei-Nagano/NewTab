import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '@/constants';
import type { AppSettings, Theme } from '@/types';
import { loadSettings } from '@/services/storage';

interface UseAppBootstrapResult {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  loaded: boolean;
  adaptiveTheme: Theme;
  setAdaptiveTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const useAppBootstrap = (): UseAppBootstrapResult => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [adaptiveTheme, setAdaptiveTheme] = useState<Theme>('dark');

  useEffect(() => {
    const initialize = async () => {
      try {
        const stored = await loadSettings();
        setSettings(stored);
        setAdaptiveTheme(stored.theme);
      } catch (error) {
        console.error('加载设置失败:', error);
        setSettings(DEFAULT_SETTINGS);
        setAdaptiveTheme(DEFAULT_SETTINGS.theme);
        return;
      } finally {
        setLoaded(true);
      }
    };

    initialize();
  }, []);

  return {
    settings,
    setSettings,
    loaded,
    adaptiveTheme,
    setAdaptiveTheme,
  };
};
