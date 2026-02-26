import { useEffect, useMemo, useState } from 'react';
import type { AppSettings } from '@/types';
import { ALL_GROUP_ID } from '@/settings/links/constants';
import { SELECTED_GROUP_STORAGE_KEY } from '@/features/links/grid/constants';
import type { UseSettingsModalProps } from './types';
import { useBackupActions } from './useBackupActions';
import { useBookmarkImport } from './useBookmarkImport';
import { useResetActions } from './useResetActions';

const readHomeSelectedGroupId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(SELECTED_GROUP_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const useSettingsModal = ({ isOpen, settings, onSave, onClose }: UseSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'links' | 'backup' | 'tools' | 'about'>('general');
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });
  const [updateStatus, setUpdateStatus] = useState<'checking' | 'latest' | 'outdated' | 'error' | 'idle'>('idle');

  useEffect(() => {
    if (!isOpen) return;
    setTempSettings(settings);
    setActiveGroupId((currentGroupId) => {
      if (settings.groups.length === 0) return '';
      const homeSelectedGroupId = readHomeSelectedGroupId();
      if (homeSelectedGroupId === ALL_GROUP_ID) return ALL_GROUP_ID;
      if (homeSelectedGroupId && settings.groups.some((group) => group.id === homeSelectedGroupId)) {
        return homeSelectedGroupId;
      }

      const currentExists = settings.groups.some((group) => group.id === currentGroupId);
      if (!currentExists) {
        return settings.groups[0].id;
      }
      return currentGroupId;
    });
  }, [isOpen, settings]);

  const bookmarkImport = useBookmarkImport({
    activeGroupId,
    tempSettings,
    setTempSettings,
    setAlertConfig,
  });

  const backupActions = useBackupActions({
    tempSettings,
    setTempSettings,
  });

  const resetActions = useResetActions({
    setTempSettings,
    setAlertConfig,
  });

  const activeGroupTitle = useMemo(() => {
    if (activeGroupId === ALL_GROUP_ID) return '所有链接';
    return tempSettings.groups.find((group) => group.id === activeGroupId)?.title || '未选择分组';
  }, [activeGroupId, tempSettings.groups]);

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  return {
    activeTab,
    setActiveTab,
    tempSettings,
    setTempSettings,
    activeGroupId,
    setActiveGroupId,
    alertConfig,
    setAlertConfig,
    updateStatus,
    setUpdateStatus,
    activeGroupTitle,
    handleSave,
    ...bookmarkImport,
    ...backupActions,
    ...resetActions,
  };
};
