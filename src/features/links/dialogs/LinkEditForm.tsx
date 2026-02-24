import React, { useRef } from 'react';
import { SiteIcon } from '@/shared/components/SiteIcon';

interface LinkEditFormProps {
  title: string;
  url: string;
  icon: string;
  theme: 'light' | 'dark';
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onIconChange: (value: string) => void;
}

export const LinkEditForm: React.FC<LinkEditFormProps> = ({
  title,
  url,
  icon,
  theme,
  onTitleChange,
  onUrlChange,
  onIconChange,
}) => {
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 500 * 1024) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      onIconChange(String(readerEvent.target?.result || ''));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Icon Section */}
      <div className="flex flex-col items-center gap-4">
        <div className={`relative group w-24 h-24 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${isLight ? 'bg-gray-50 border-gray-100 shadow-lg shadow-gray-200/50' : 'bg-white/5 border-white/10 shadow-xl'
          }`}>
          <SiteIcon url={url} title={title} customIcon={icon} size="w-full h-full" className="rounded-[1.8rem]" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {icon && (
          <button
            onClick={() => onIconChange('')}
            className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isLight ? 'text-red-400 hover:text-red-600' : 'text-red-500/70 hover:text-red-400'}`}
          >
            重置自定图标
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>网站标题</label>
          <input
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold outline-none transition-all duration-300 ${isLight
                ? 'bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-500 shadow-inner'
                : 'bg-white/5 border-white/5 focus:bg-white/10 focus:border-white/20 text-white'
              }`}
            placeholder="网站标题"
          />
        </div>

        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>网站链接</label>
          <input
            type="text"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            className={`w-full px-5 py-4 rounded-2xl border text-sm font-bold outline-none transition-all duration-300 ${isLight
                ? 'bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-500 shadow-inner'
                : 'bg-white/5 border-white/5 focus:bg-white/10 focus:border-white/20 text-white'
              }`}
            placeholder="https://example.com"
          />
        </div>
      </div>
    </div>
  );
};
