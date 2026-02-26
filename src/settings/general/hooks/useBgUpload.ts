import type { AppSettings } from '@/types';

const MAX_UPLOAD_MB = 5;
const BYTES_PER_MB = 1000;
const MAX_FILE_SIZE_BYTES = MAX_UPLOAD_MB * BYTES_PER_MB * BYTES_PER_MB;

export const useBgUpload = (
  settings: AppSettings,
  onSettingsChange: (settings: AppSettings) => void
) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
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
