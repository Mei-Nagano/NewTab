import React from 'react';
import { SiteIcon } from '@/shared/components/SiteIcon';
import { IconSourcePicker } from '@/shared/components/IconSourcePicker';

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

  return (
    <div className="space-y-8">
      {/* Icon Section */}
      <div className="flex flex-col items-center gap-4">
        <div className={`relative group w-24 h-24 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${isLight ? 'bg-gray-50 border-gray-100 shadow-lg shadow-gray-200/50' : 'bg-white/5 border-white/10 shadow-xl'
          }`}>
          <SiteIcon url={url} title={title} customIcon={icon} size="w-full h-full" className="rounded-[1.8rem]" />
        </div>
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

        <IconSourcePicker
          theme={theme}
          icon={icon}
          onIconChange={onIconChange}
        />
      </div>
    </div>
  );
};
