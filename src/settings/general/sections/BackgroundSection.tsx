import { useRef } from 'react';
import type { AppSettings } from '@/types';
import { Switch } from '@/shared/components/Switch';
import { SettingSection } from '../../components/SettingSection';
import { useBgUpload } from '../hooks/useBgUpload';
import { BACKGROUND_OPTIONS } from '../options';

interface BackgroundSectionProps {
  settings: AppSettings;
  theme: 'light' | 'dark';
  onSettingsChange: (settings: AppSettings) => void;
  onSaveWallpaper?: () => void;
}

const MIN_BLUR_AMOUNT = 0;
const MAX_BLUR_AMOUNT = 24;
const DEFAULT_BLUR_AMOUNT = 8;
const MIN_DARK_MASK_OPACITY = 0;
const MAX_DARK_MASK_OPACITY = 100;
const DEFAULT_DARK_MASK_OPACITY = 40;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  settings,
  theme,
  onSettingsChange,
  onSaveWallpaper,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = useBgUpload(settings, onSettingsChange);
  const isLight = theme === 'light';
  const hasLocalUploadedImage =
    settings.customBgUrl?.startsWith('data:') ||
    settings.customBgUrl === '[LOCAL_IMAGE]';
  const blurAmount = clamp(
    settings.bgBlurAmount ?? DEFAULT_BLUR_AMOUNT,
    MIN_BLUR_AMOUNT,
    MAX_BLUR_AMOUNT
  );
  const darkMaskOpacity = clamp(
    settings.darkMaskOpacity ?? DEFAULT_DARK_MASK_OPACITY,
    MIN_DARK_MASK_OPACITY,
    MAX_DARK_MASK_OPACITY
  );

  return (
    <SettingSection
      title={'\u80cc\u666f\u4e0e\u89c6\u89c9'}
      theme={theme}
    >
      <div className="grid grid-cols-3 gap-4">
        {BACKGROUND_OPTIONS.map((item) => (
          <button
            key={item.value}
            onClick={() => onSettingsChange({ ...settings, bgType: item.value })}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              settings.bgType === item.value
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                : isLight
                  ? 'border-gray-200 bg-white hover:border-blue-300'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-sm font-bold">{item.label}</div>
            <div
              className={`text-[11px] font-medium ${
                isLight ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {item.desc}
            </div>
          </button>
        ))}
      </div>

      {settings.bgType === 'custom' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={hasLocalUploadedImage ? '' : settings.customBgUrl}
              onChange={(event) =>
                onSettingsChange({ ...settings, customBgUrl: event.target.value })
              }
              className={`flex-1 px-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${
                isLight
                  ? 'bg-white border-gray-100 text-gray-900 focus:border-blue-500'
                  : 'bg-black/20 border-white/5 text-white focus:border-blue-500/50'
              }`}
              placeholder={
                hasLocalUploadedImage
                  ? '\u5df2\u4f7f\u7528\u672c\u5730\u56fe\u7247\uff0c\u8f93\u5165 URL \u5c06\u8986\u76d6'
                  : '\u8f93\u5165\u56fe\u7247 URL'
              }
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isLight
                  ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              {'\u4e0a\u4f20\u56fe\u7247'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          {hasLocalUploadedImage && (
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {
                '\u5f53\u524d\u4f7f\u7528\u7684\u662f\u672c\u5730\u4e0a\u4f20\u56fe\u7247\uff0c\u76f4\u63a5\u8f93\u5165\u94fe\u63a5\u5373\u53ef\u5207\u6362\u4e3a\u7f51\u7edc\u56fe\u7247\u3002'
              }
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`flex items-center justify-between p-4 px-5 rounded-2xl border transition-all duration-300 ${
            isLight
              ? 'border-gray-200 bg-white hover:border-blue-200 shadow-sm'
              : 'border-white/5 bg-white/5 hover:bg-white/[0.08]'
          }`}
        >
          <div className="flex-1 pr-4">
            <div
              className={`text-sm font-bold ${
                isLight ? 'text-gray-900' : 'text-gray-100'
              }`}
            >
              {'\u80cc\u666f\u6a21\u7cca'}
            </div>
            <div
              className={`text-[11px] mt-0.5 font-medium ${
                isLight ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {'\u4e3a\u58c1\u7eb8\u6dfb\u52a0\u6bdb\u73bb\u7483\u6548\u679c'}
            </div>
          </div>
          <Switch
            checked={!!settings.bgBlur}
            onChange={(checked) =>
              onSettingsChange({
                ...settings,
                bgBlur: checked,
                bgBlurAmount: settings.bgBlurAmount ?? DEFAULT_BLUR_AMOUNT,
              })
            }
            theme={theme}
            accentColor="bg-blue-500"
          />
        </div>

        <div
          className={`flex items-center justify-between p-4 px-5 rounded-2xl border transition-all duration-300 ${
            isLight
              ? 'border-gray-200 bg-white hover:border-blue-200 shadow-sm'
              : 'border-white/5 bg-white/5 hover:bg-white/[0.08]'
          }`}
        >
          <div className="flex-1 pr-4">
            <div
              className={`text-sm font-bold ${
                isLight ? 'text-gray-900' : 'text-gray-100'
              }`}
            >
              {'\u591c\u95f4\u906e\u7f69'}
            </div>
            <div
              className={`text-[11px] mt-0.5 font-medium ${
                isLight ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {
                '\u964d\u4f4e\u4eae\u8272\u58c1\u7eb8\u5728\u591c\u95f4\u6a21\u5f0f\u4e0b\u7684\u523a\u773c\u7a0b\u5ea6'
              }
            </div>
          </div>
          <Switch
            checked={!!settings.enableDarkMask}
            onChange={(checked) =>
              onSettingsChange({
                ...settings,
                enableDarkMask: checked,
                darkMaskOpacity: settings.darkMaskOpacity ?? DEFAULT_DARK_MASK_OPACITY,
              })
            }
            theme={theme}
            accentColor="bg-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`p-4 px-5 rounded-2xl border transition-all duration-300 ${
            isLight ? 'border-gray-200 bg-white shadow-sm' : 'border-white/5 bg-white/5'
          } ${!settings.bgBlur ? 'opacity-60' : ''}`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wide ${
                isLight ? 'text-gray-600' : 'text-gray-300'
              }`}
            >
              {'\u6a21\u7cca\u5f3a\u5ea6'}
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
              {blurAmount}px
            </span>
          </div>
          <input
            type="range"
            min={MIN_BLUR_AMOUNT}
            max={MAX_BLUR_AMOUNT}
            step={1}
            value={blurAmount}
            disabled={!settings.bgBlur}
            onChange={(event) =>
              onSettingsChange({ ...settings, bgBlurAmount: Number(event.target.value) })
            }
            className="w-full h-1.5 rounded-lg cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
          />
        </div>

        <div
          className={`p-4 px-5 rounded-2xl border transition-all duration-300 ${
            isLight ? 'border-gray-200 bg-white shadow-sm' : 'border-white/5 bg-white/5'
          } ${!settings.enableDarkMask ? 'opacity-60' : ''}`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wide ${
                isLight ? 'text-gray-600' : 'text-gray-300'
              }`}
            >
              {'\u906e\u7f69\u5f3a\u5ea6'}
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
              {darkMaskOpacity}%
            </span>
          </div>
          <input
            type="range"
            min={MIN_DARK_MASK_OPACITY}
            max={MAX_DARK_MASK_OPACITY}
            step={1}
            value={darkMaskOpacity}
            disabled={!settings.enableDarkMask}
            onChange={(event) =>
              onSettingsChange({ ...settings, darkMaskOpacity: Number(event.target.value) })
            }
            className="w-full h-1.5 rounded-lg cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <button
        onClick={onSaveWallpaper}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] ${
          isLight
            ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
        }`}
      >
        {'\u4fdd\u5b58\u5f53\u524d\u58c1\u7eb8'}
      </button>
    </SettingSection>
  );
};
