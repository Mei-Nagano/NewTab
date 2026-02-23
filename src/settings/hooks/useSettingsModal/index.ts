import { useEffect, useMemo, useState } from 'react';
import type { AppSettings } from '@/types';
import type { UseSettingsModalProps } from './types';
import { useBackupActions } from './useBackupActions';
import { useBookmarkImport } from './useBookmarkImport';
import { useResetActions } from './useResetActions';

const ALL_GROUP_ID = '__all__';

export const useSettingsModal = ({ isOpen, settings, onSave, onClose }: UseSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'links' | 'backup' | 'tools' | 'about'>('general');
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });
  const [updateStatus, setUpdateStatus] = useState<'checking' | 'latest' | 'outdated' | 'error' | 'idle'>('idle');

  useEffect(() => {
    if (!isOpen) return;
    setTempSettings(settings);
    if (settings.groups.length > 0) {
      const currentExists = settings.groups.some((group) => group.id === activeGroupId);
      if (!currentExists || activeGroupId === ALL_GROUP_ID) {
        setActiveGroupId(settings.groups[0].id);
      }
    } else {
      setActiveGroupId('');
    }
  }, [isOpen, settings, activeGroupId]);

  const bookmarkImport = useBookmarkImport({
    activeGroupId,
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
