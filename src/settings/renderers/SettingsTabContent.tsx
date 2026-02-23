import { AboutTab } from '@/components/settings/AboutTab';
import { BackupTab } from '@/components/settings/BackupTab';
import { GeneralTab } from '@/components/settings/GeneralTab';
import { LinksTab } from '@/components/settings/LinksTab';
import { ToolsTab } from '@/components/settings/ToolsTab';
import type { AppSettings } from '@/types';

interface SettingsTabContentProps {
  activeTab: 'general' | 'links' | 'backup' | 'tools' | 'about';
  theme: 'light' | 'dark';
  backgroundImage?: string;
  tempSettings: AppSettings;
  activeGroupId: string;
  isFetchingBookmarks: boolean;
  cacheClearStatus: string;
  onSettingsChange: React.Dispatch<React.SetStateAction<AppSettings>>;
  onGroupChange: (groupId: string) => void;
  onStartImport: () => void;
  onClearCache: () => void;
  onResetSettings: () => void;
  onSaveWallpaper?: () => void;
  onBackup: () => void;
  onRestore: () => void;
  onExport: () => void;
  onImport: () => void;
  backupStatus: { type: string; message: string };
  onUpdateStatusChange: (status: 'checking' | 'latest' | 'outdated' | 'error') => void;
}

export const SettingsTabContent: React.FC<SettingsTabContentProps> = (props) => {
  const {
    activeTab,
    theme,
    backgroundImage,
    tempSettings,
    activeGroupId,
    isFetchingBookmarks,
    cacheClearStatus,
    onSettingsChange,
    onGroupChange,
    onStartImport,
    onClearCache,
    onResetSettings,
    onSaveWallpaper,
    onBackup,
    onRestore,
    onExport,
    onImport,
    backupStatus,
    onUpdateStatusChange,
  } = props;

  if (activeTab === 'general') {
    return <GeneralTab settings={tempSettings} onSettingsChange={onSettingsChange} onClearCache={onClearCache} cacheClearStatus={cacheClearStatus} onResetSettings={onResetSettings} onSaveWallpaper={onSaveWallpaper} theme={theme} />;
  }
  if (activeTab === 'links') {
    return <LinksTab settings={tempSettings} onSettingsChange={onSettingsChange} activeGroupId={activeGroupId} setActiveGroupId={onGroupChange} onStartImport={onStartImport} isFetchingBookmarks={isFetchingBookmarks} theme={theme} />;
  }
  if (activeTab === 'backup') {
    return <BackupTab settings={tempSettings} setSettings={onSettingsChange} status={backupStatus} onBackup={onBackup} onRestore={onRestore} onExport={onExport} onImport={onImport} theme={theme} />;
  }
  if (activeTab === 'tools') {
    return <ToolsTab theme={theme} backgroundImage={backgroundImage} settings={tempSettings} onSettingsChange={onSettingsChange} />;
  }
  return <AboutTab theme={theme} onUpdateStatusChange={onUpdateStatusChange} />;
};
