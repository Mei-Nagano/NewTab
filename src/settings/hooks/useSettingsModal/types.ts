import type { AppSettings } from '@/types';
import type { BrowserBookmarkFolder } from '@/services/storage/bookmarkStore';

export interface UseSettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export type SettingsTab = 'general' | 'links' | 'backup' | 'tools' | 'about';

export interface AlertConfig {
  isOpen: boolean;
  title: string;
  message: string;
}

export interface UseSettingsModalState {
  activeTab: SettingsTab;
  tempSettings: AppSettings;
  activeGroupId: string;
  isImportMode: boolean;
  isFetchingBookmarks: boolean;
  bookmarkFolders: BrowserBookmarkFolder[];
  selectedLinkIds: Set<string>;
  expandedFolderIds: Set<string>;
  importTarget: 'current-group' | 'new-groups';
  searchTerm: string;
  backupStatus: 'idle' | 'loading' | 'success' | 'error';
  statusMessage: string;
  cacheClearStatus: string;
  updateStatus: 'checking' | 'latest' | 'outdated' | 'error' | 'idle';
  alertConfig: AlertConfig;
  resetConfirmDialog: { isOpen: boolean };
}
