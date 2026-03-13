import { useEffect, useRef, useState } from 'react';
import type { AppSettings } from '@/types';
import {
  listFavoriteWallpapers,
  removeFavoriteWallpaper,
  saveFavoriteWallpaper,
  type FavoriteWallpaper,
} from '@/services/storage';
import { Switch } from '@/shared/components/Switch';
import { SettingSection } from '../../components/SettingSection';
import { useBgUpload } from '../hooks/useBgUpload';
import { BACKGROUND_OPTIONS } from '../options';

interface BackgroundSectionProps {
  settings: AppSettings;
  theme: 'light' | 'dark';
  backgroundImage?: string;
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

const sectionTextMutedClass = (isLight: boolean): string =>
  isLight ? 'text-gray-500' : 'text-gray-400';

const optionCardClass = (isLight: boolean, isSelected: boolean): string => {
  if (isSelected) {
    return 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10';
  }
  return isLight
    ? 'border-gray-200 bg-white hover:border-blue-300'
    : 'border-white/10 bg-white/5 hover:bg-white/10';
};

const customUrlInputClass = (isLight: boolean): string =>
  isLight
    ? 'bg-white border-gray-100 text-gray-900 focus:border-blue-500'
    : 'bg-black/20 border-white/5 text-white focus:border-blue-500/50';

const uploadButtonClass = (isLight: boolean): string =>
  isLight
    ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10';

const switchCardClass = (isLight: boolean): string =>
  isLight
    ? 'border-gray-200 bg-white hover:border-blue-200 shadow-sm'
    : 'border-white/5 bg-white/5 hover:bg-white/[0.08]';

const switchTitleClass = (isLight: boolean): string =>
  isLight ? 'text-gray-900' : 'text-gray-100';

const sliderLabelClass = (isLight: boolean): string =>
  isLight ? 'text-gray-600' : 'text-gray-300';

const sliderContainerClass = (isLight: boolean, isEnabled: boolean): string => {
  const base = isLight
    ? 'border-gray-200 bg-white shadow-sm'
    : 'border-white/5 bg-white/5';
  const visibility = isEnabled ? '' : 'opacity-60';
  return `p-4 px-5 rounded-2xl border transition-all duration-300 ${base} ${visibility}`.trim();
};

const favoriteCardClass = (isLight: boolean): string =>
  isLight
    ? 'border-gray-200 bg-white shadow-sm'
    : 'border-white/10 bg-white/5';

const favoriteActionClass = (isLight: boolean): string =>
  isLight
    ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
    : 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10';

const formatFavoriteDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '已收藏';
  }
  return `收藏于 ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const toSafeWallpaperUrl = (value: string): string | null => {
  if (!value) return null;
  if (value.startsWith('data:image/') || value.startsWith('blob:')) return value;

  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
};

const downloadWallpaper = async (backgroundImage: string) => {
  const safeWallpaperUrl = toSafeWallpaperUrl(backgroundImage);
  if (!safeWallpaperUrl) return;

  try {
    const response = await fetch(safeWallpaperUrl);
    const blob = await response.blob();
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallpaper-${new Date().toISOString().split('T')[0]}.${blob.type.split('/')[1] || 'jpg'}`;
    link.click();
    globalThis.URL.revokeObjectURL(url);
  } catch {
    const link = document.createElement('a');
    link.href = safeWallpaperUrl;
    link.download = `wallpaper-${Date.now()}`;
    link.click();
  }
};

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  settings,
  theme,
  backgroundImage,
  onSettingsChange,
  onSaveWallpaper,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = useBgUpload(settings, onSettingsChange);
  const isLight = theme === 'light';
  const [favorites, setFavorites] = useState<FavoriteWallpaper[]>([]);
  const [favoriteStatus, setFavoriteStatus] = useState('');
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
  const blurEnabled = Boolean(settings.bgBlur);
  const darkMaskEnabled = Boolean(settings.enableDarkMask);

  useEffect(() => {
    void listFavoriteWallpapers().then(setFavorites);
  }, []);

  const handleFavoriteCurrentWallpaper = async () => {
    if (!backgroundImage) {
      setFavoriteStatus('当前还没有可收藏的壁纸');
      return;
    }

    const result = await saveFavoriteWallpaper(backgroundImage);
    if (result === 'added') {
      const nextFavorites = await listFavoriteWallpapers();
      setFavorites(nextFavorites);
      setFavoriteStatus('当前壁纸已加入收藏');
      return;
    }
    if (result === 'exists') {
      setFavoriteStatus('这张壁纸已经收藏过了');
      return;
    }
    setFavoriteStatus('收藏失败，当前壁纸可能不支持本地保存');
  };

  const handleApplyFavorite = (favorite: FavoriteWallpaper) => {
    onSettingsChange({
      ...settings,
      bgType: 'custom',
      customBgUrl: favorite.image,
    });
    setFavoriteStatus('已切换到收藏壁纸，保存设置后生效');
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await removeFavoriteWallpaper(favoriteId);
    const nextFavorites = await listFavoriteWallpapers();
    setFavorites(nextFavorites);
    setFavoriteStatus('已移除收藏壁纸');
  };

  return (
    <SettingSection
      title={'背景与视觉'}
      theme={theme}
    >
      <div className="grid grid-cols-3 gap-4">
        {BACKGROUND_OPTIONS.map((item) => (
          <button
            key={item.value}
            onClick={() => onSettingsChange({ ...settings, bgType: item.value })}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${optionCardClass(isLight, settings.bgType === item.value)}`}
          >
            <div className="text-sm font-bold">{item.label}</div>
            <div className={`text-[11px] font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
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
              className={`flex-1 px-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${customUrlInputClass(isLight)}`}
              placeholder={
                hasLocalUploadedImage
                  ? '已使用本地图片，输入 URL 将覆盖'
                  : '输入图片 URL'
              }
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${uploadButtonClass(isLight)}`}
            >
              {'上传图片'}
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
            <p className={`text-xs ${sectionTextMutedClass(isLight)}`}>
              {'当前使用的是本地上传图片，直接输入链接即可切换为网络图片。'}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`flex items-center justify-between p-4 px-5 rounded-2xl border transition-all duration-300 ${switchCardClass(isLight)}`}>
          <div className="flex-1 pr-4">
            <div className={`text-sm font-bold ${switchTitleClass(isLight)}`}>
              {'背景模糊'}
            </div>
            <div className={`text-[11px] mt-0.5 font-medium ${sectionTextMutedClass(isLight)}`}>
              {'为壁纸添加毛玻璃效果'}
            </div>
          </div>
          <Switch
            checked={blurEnabled}
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

        <div className={`flex items-center justify-between p-4 px-5 rounded-2xl border transition-all duration-300 ${switchCardClass(isLight)}`}>
          <div className="flex-1 pr-4">
            <div className={`text-sm font-bold ${switchTitleClass(isLight)}`}>
              {'夜间遮罩'}
            </div>
            <div className={`text-[11px] mt-0.5 font-medium ${sectionTextMutedClass(isLight)}`}>
              {'降低亮色壁纸在夜间模式下的刺眼程度'}
            </div>
          </div>
          <Switch
            checked={darkMaskEnabled}
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
        <div className={sliderContainerClass(isLight, blurEnabled)}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className={`text-xs font-bold uppercase tracking-wide ${sliderLabelClass(isLight)}`}>
              {'模糊强度'}
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
            disabled={!blurEnabled}
            onChange={(event) =>
              onSettingsChange({ ...settings, bgBlurAmount: Number(event.target.value) })
            }
            className="w-full h-1.5 rounded-lg cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
          />
        </div>

        <div className={sliderContainerClass(isLight, darkMaskEnabled)}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className={`text-xs font-bold uppercase tracking-wide ${sliderLabelClass(isLight)}`}>
              {'遮罩强度'}
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
            disabled={!darkMaskEnabled}
            onChange={(event) =>
              onSettingsChange({ ...settings, darkMaskOpacity: Number(event.target.value) })
            }
            className="w-full h-1.5 rounded-lg cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className={`p-4 rounded-2xl border space-y-4 ${favoriteCardClass(isLight)}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className={`text-sm font-bold ${switchTitleClass(isLight)}`}>当前壁纸</div>
            <div className={`text-[11px] font-medium ${sectionTextMutedClass(isLight)}`}>
              Bing 每日壁纸会在当天本地缓存，第二天自动失效并拉取新图。
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFavoriteCurrentWallpaper}
              disabled={!backgroundImage}
              className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${favoriteActionClass(isLight)}`}
            >
              收藏当前壁纸
            </button>
            <button
              onClick={onSaveWallpaper}
              disabled={!backgroundImage}
              className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${favoriteActionClass(isLight)}`}
            >
              下载当前壁纸
            </button>
          </div>
        </div>
        {favoriteStatus && (
          <p className={`text-xs ${sectionTextMutedClass(isLight)}`}>{favoriteStatus}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={`text-sm font-bold ${switchTitleClass(isLight)}`}>壁纸收藏</div>
            <div className={`text-[11px] font-medium ${sectionTextMutedClass(isLight)}`}>
              可直接更换为收藏壁纸，或者单独下载到本地。
            </div>
          </div>
          <span className={`text-xs font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
            {favorites.length} 张
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className={`p-4 rounded-2xl border text-sm ${favoriteCardClass(isLight)} ${sectionTextMutedClass(isLight)}`}>
            还没有收藏壁纸，先从当前壁纸开始收藏吧。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className={`rounded-2xl border overflow-hidden ${favoriteCardClass(isLight)}`}>
                <div
                  className="h-36 bg-cover bg-center"
                  style={{ backgroundImage: `url(${favorite.image})` }}
                />
                <div className="p-4 space-y-3">
                  <div>
                    <div className={`text-sm font-bold ${switchTitleClass(isLight)}`}>收藏壁纸</div>
                    <div className={`text-[11px] font-medium ${sectionTextMutedClass(isLight)}`}>
                      {formatFavoriteDate(favorite.addedAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApplyFavorite(favorite)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${favoriteActionClass(isLight)}`}
                    >
                      设为当前
                    </button>
                    <button
                      onClick={() => void downloadWallpaper(favorite.image)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${favoriteActionClass(isLight)}`}
                    >
                      下载
                    </button>
                    <button
                      onClick={() => void handleRemoveFavorite(favorite.id)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${isLight ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15'}`}
                    >
                      移除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SettingSection>
  );
};
