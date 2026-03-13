import { useState } from 'react';
import { DEFAULT_SETTINGS } from '@/constants';
import { clearCachedFavicons } from '@/services/storage';
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
    void clearCachedFavicons().then((count) => {
      setCacheClearStatus(`已清理 ${count} 个缓存图标`);
      window.setTimeout(() => setCacheClearStatus(''), 2500);
    });
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
