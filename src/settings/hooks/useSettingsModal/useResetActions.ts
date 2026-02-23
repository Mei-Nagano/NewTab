import { useState } from 'react';
import { DEFAULT_SETTINGS } from '@/constants';
import type { AppSettings } from '@/types';
import type { AlertConfig } from './types';

interface UseResetActionsParams {
  setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  setAlertConfig: React.Dispatch<React.SetStateAction<AlertConfig>>;
}

export const useResetActions = ({ setTempSettings, setAlertConfig }: UseResetActionsParams) => {
  const [cacheClearStatus, setCacheClearStatus] = useState('');
  const [resetConfirmDialog, setResetConfirmDialog] = useState({ isOpen: false });

  const handleClearCache = () => {
    const keys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith('newtab_fav_')) {
        keys.push(key);
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
    setCacheClearStatus(`已清理 ${keys.length} 个缓存图标`);
    window.setTimeout(() => setCacheClearStatus(''), 2500);
  };

  const handleResetSettings = () => {
    setResetConfirmDialog({ isOpen: true });
  };

  const confirmResetSettings = () => {
    setTempSettings((previous) => ({
      ...DEFAULT_SETTINGS,
      groups: previous.groups,
    }));
    setResetConfirmDialog({ isOpen: false });
    setAlertConfig({
      isOpen: true,
      title: '设置已还原',
      message: '已恢复默认设置，并保留你的分组和链接。',
    });
  };

  return {
    cacheClearStatus,
    resetConfirmDialog,
    setResetConfirmDialog,
    handleClearCache,
    handleResetSettings,
    confirmResetSettings,
  };
};
