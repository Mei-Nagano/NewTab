import { DEFAULT_SETTINGS } from '@/constants';
import type { AppSettings } from '@/types';
import { normalizeSettings } from './migrations';

export const exportSettingsToFile = (settings: AppSettings): void => {
  const exportData = { ...settings };
  if (exportData.customBgUrl.startsWith('data:')) {
    exportData.customBgUrl = '';
  }

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  const filename = `newtab-backup-${new Date().toISOString().slice(0, 10)}.json`;

  const linkElement = document.createElement('a');
  linkElement.href = dataUri;
  linkElement.download = filename;
  linkElement.click();
};

const validateSettings = (data: unknown): AppSettings => {
  if (!data || typeof data !== 'object') {
    throw new Error('无效的设置文件');
  }

  return normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...(data as Partial<AppSettings>),
  });
};

export const importSettingsFromFile = (): Promise<AppSettings> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) {
        reject(new Error('未选择文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        try {
          const content = String(readerEvent.target?.result || '');
          resolve(validateSettings(JSON.parse(content)));
        } catch (error) {
          reject(error instanceof Error ? error : new Error('导入失败'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    };

    input.click();
  });
};
