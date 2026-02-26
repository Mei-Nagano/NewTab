import React, { useEffect, useRef, useState } from 'react';
import { ImageUp, Link2, Sparkles } from 'lucide-react';

type IconSourceMode = 'auto' | 'url' | 'upload';

const MAX_UPLOAD_ICON_SIZE = 500 * 1024;
const MAX_UPLOAD_ICON_SIZE_LABEL = '500KB';

const isUploadDataIcon = (value: string): boolean => value.trim().startsWith('data:image/');

const resolveMode = (icon: string): IconSourceMode => {
  const trimmed = icon.trim();
  if (!trimmed) return 'auto';
  return isUploadDataIcon(trimmed) ? 'upload' : 'url';
};

interface IconSourcePickerProps {
  theme: 'light' | 'dark';
  icon: string;
  onIconChange: (value: string) => void;
}

export const IconSourcePicker: React.FC<IconSourcePickerProps> = ({
  theme,
  icon,
  onIconChange,
}) => {
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<IconSourceMode>(() => resolveMode(icon));
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(resolveMode(icon));
  }, [icon]);

  const applyMode = (nextMode: IconSourceMode) => {
    setMode(nextMode);
    setError('');
    if (nextMode === 'auto') {
      onIconChange('');
      return;
    }

    if (nextMode === 'url' && isUploadDataIcon(icon)) {
      onIconChange('');
    }
    if (nextMode === 'upload' && !isUploadDataIcon(icon)) {
      onIconChange('');
    }
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（PNG/JPG/SVG/WebP 等）。');
      return;
    }
    if (file.size > MAX_UPLOAD_ICON_SIZE) {
      setError(`图片过大，请选择小于 ${MAX_UPLOAD_ICON_SIZE_LABEL} 的文件。`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result;
      if (typeof result !== 'string') {
        setError('图片读取失败，请重试。');
        return;
      }
      setError('');
      onIconChange(result);
    };
    reader.onerror = () => setError('图片读取失败，请重试。');
    reader.readAsDataURL(file);
  };

  const tabClass = (active: boolean) =>
    `flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
      active
        ? isLight
          ? 'bg-blue-50 border-blue-300 text-blue-700'
          : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
        : isLight
          ? 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
          : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
    }`;

  return (
    <div className="space-y-3">
      <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>图标来源</label>

      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => applyMode('auto')} className={tabClass(mode === 'auto')}>
          <Sparkles size={14} />
          自动
        </button>
        <button type="button" onClick={() => applyMode('url')} className={tabClass(mode === 'url')}>
          <Link2 size={14} />
          URL
        </button>
        <button type="button" onClick={() => applyMode('upload')} className={tabClass(mode === 'upload')}>
          <ImageUp size={14} />
          上传
        </button>
      </div>

      {mode === 'auto' && (
        <div className={`px-4 py-3 rounded-xl border text-xs font-medium ${isLight ? 'bg-gray-50 border-gray-100 text-gray-600' : 'bg-white/5 border-white/10 text-gray-300'}`}>
          将根据网站地址自动获取图标。
        </div>
      )}

      {mode === 'url' && (
        <input
          type="text"
          value={icon}
          onChange={(event) => onIconChange(event.target.value)}
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${isLight ? 'bg-white border-gray-200 text-gray-900 focus:border-blue-400' : 'bg-black/20 border-white/10 text-white focus:border-blue-400/60'}`}
          placeholder="https://example.com/favicon.ico"
        />
      )}

      {mode === 'upload' && (
        <div className={`space-y-2 p-3 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold border transition-all ${isLight ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' : 'bg-black/20 border-white/10 text-gray-200 hover:bg-black/30'}`}
          >
            选择本地图片
          </button>
          <p className={`text-xs ${error ? 'text-red-500' : isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            {error || `文件大小需小于 ${MAX_UPLOAD_ICON_SIZE_LABEL}`}
          </p>
        </div>
      )}
    </div>
  );
};
