import { useRef } from 'react';
import type { AppSettings } from '@/types';
import { BACKGROUND_OPTIONS } from '../options';
import { useBgUpload } from '../hooks/useBgUpload';

interface BackgroundSectionProps {
  settings: AppSettings;
  theme: 'light' | 'dark';
  onSettingsChange: (settings: AppSettings) => void;
  onSaveWallpaper?: () => void;
}

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  settings,
  theme,
  onSettingsChange,
  onSaveWallpaper,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = useBgUpload(settings, onSettingsChange);
  const isLight = theme === 'light';

  return (
    <section className="space-y-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>背景与视觉</h4>
      <div className="grid grid-cols-3 gap-4">
        {BACKGROUND_OPTIONS.map((item) => (
          <button key={item.value} onClick={() => onSettingsChange({ ...settings, bgType: item.value })} className={`p-4 rounded-2xl border text-left ${settings.bgType === item.value ? 'border-blue-500 bg-blue-500/10' : isLight ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>
            <div className="text-sm font-bold">{item.label}</div>
            <div className="text-[11px] text-gray-500">{item.desc}</div>
          </button>
        ))}
      </div>

      {settings.bgType === 'custom' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={settings.customBgUrl?.startsWith('data:') ? '本地上传图片' : settings.customBgUrl} onChange={(event) => onSettingsChange({ ...settings, customBgUrl: event.target.value })} readOnly={settings.customBgUrl?.startsWith('data:')} className={`flex-1 px-4 py-3 rounded-xl border text-sm ${isLight ? 'bg-gray-50 border-gray-100 text-gray-900' : 'bg-black/20 border-white/5 text-white'}`} placeholder="输入图片 URL" />
            <button onClick={() => fileInputRef.current?.click()} className={`px-4 py-3 rounded-xl border text-sm font-bold ${isLight ? 'bg-white border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300'}`}>上传图片</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onSettingsChange({ ...settings, bgBlur: !settings.bgBlur })} className={`p-4 rounded-2xl border text-left ${settings.bgBlur ? 'border-blue-500 bg-blue-500/10' : isLight ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>背景模糊</button>
        <button onClick={() => onSettingsChange({ ...settings, enableDarkMask: !settings.enableDarkMask })} className={`p-4 rounded-2xl border text-left ${settings.enableDarkMask ? 'border-blue-500 bg-blue-500/10' : isLight ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>夜间遮罩</button>
      </div>

      <button onClick={onSaveWallpaper} className={`px-4 py-3 rounded-xl border text-sm font-bold ${isLight ? 'bg-white border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300'}`}>保存当前壁纸</button>
    </section>
  );
};
