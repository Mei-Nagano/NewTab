import type { AppSettings } from '@/types';

export const useBgUpload = (
  settings: AppSettings,
  onSettingsChange: (settings: AppSettings) => void
) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      onSettingsChange({
        ...settings,
        customBgUrl: String(readerEvent.target?.result || ''),
      });
    };
    reader.readAsDataURL(file);
  };
};
