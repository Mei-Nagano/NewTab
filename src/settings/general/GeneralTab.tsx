import type { AppSettings } from '@/types';
import { AppearanceSection } from './sections/AppearanceSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { DisplaySection } from './sections/DisplaySection';
import { SearchSection } from './sections/SearchSection';
import { SystemSection } from './sections/SystemSection';

interface GeneralTabProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClearCache: () => void;
  cacheClearStatus: string;
  onResetSettings: () => void;
  onSaveWallpaper?: () => void;
  theme: 'light' | 'dark';
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onSettingsChange,
  onClearCache,
  cacheClearStatus,
  onResetSettings,
  onSaveWallpaper,
  theme,
}) => {
  return (
    <div className="space-y-8 pb-4">
      <BackgroundSection settings={settings} onSettingsChange={onSettingsChange} onSaveWallpaper={onSaveWallpaper} theme={theme} />
      <DisplaySection settings={settings} onSettingsChange={onSettingsChange} theme={theme} />
      <SearchSection settings={settings} onSettingsChange={onSettingsChange} theme={theme} />
      <AppearanceSection settings={settings} onSettingsChange={onSettingsChange} theme={theme} />
      <SystemSection theme={theme} cacheClearStatus={cacheClearStatus} onClearCache={onClearCache} onResetSettings={onResetSettings} />
    </div>
  );
};
