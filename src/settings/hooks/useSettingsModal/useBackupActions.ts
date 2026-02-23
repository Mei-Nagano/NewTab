import { useState } from 'react';
import type { AppSettings } from '@/types';
import { exportSettingsToFile, importSettingsFromFile } from '@/services/storage';
import { backupToWebDav, restoreFromWebDav } from '@/services/webdav';

interface UseBackupActionsParams {
  tempSettings: AppSettings;
  setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const useBackupActions = ({ tempSettings, setTempSettings }: UseBackupActionsParams) => {
  const [backupStatus, setBackupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleBackup = async () => {
    setBackupStatus('loading');
    setStatusMessage('正在上传设置...');
    try {
      await backupToWebDav(tempSettings);
      setBackupStatus('success');
      setStatusMessage('备份完成');
    } catch (error) {
      setBackupStatus('error');
      setStatusMessage(error instanceof Error ? error.message : '备份失败');
    }
  };

  const handleRestore = async () => {
    setBackupStatus('loading');
    setStatusMessage('正在下载设置...');
    try {
      const restored = await restoreFromWebDav(tempSettings.webdav);
      setTempSettings((previous) => ({ ...previous, ...restored, webdav: previous.webdav }));
      setBackupStatus('success');
      setStatusMessage('恢复完成，请保存应用');
    } catch (error) {
      setBackupStatus('error');
      setStatusMessage(error instanceof Error ? error.message : '恢复失败');
    }
  };

  const handleLocalExport = () => {
    try {
      exportSettingsToFile(tempSettings);
      setBackupStatus('success');
      setStatusMessage('本地导出成功');
    } catch (error) {
      setBackupStatus('error');
      setStatusMessage(error instanceof Error ? error.message : '导出失败');
    }
  };

  const handleLocalImport = async () => {
    try {
      setBackupStatus('loading');
      setStatusMessage('正在读取备份文件...');
      const imported = await importSettingsFromFile();
      setTempSettings((previous) => ({ ...previous, ...imported, webdav: previous.webdav }));
      setBackupStatus('success');
      setStatusMessage('本地导入成功，请保存应用');
    } catch (error) {
      setBackupStatus('error');
      setStatusMessage(error instanceof Error ? error.message : '导入失败');
    }
  };

  return {
    backupStatus,
    statusMessage,
    handleBackup,
    handleRestore,
    handleLocalExport,
    handleLocalImport,
  };
};
