import type { AppSettings, HideOptions } from '@/types';

interface DisplaySectionProps {
  settings: AppSettings;
  theme: 'light' | 'dark';
  onSettingsChange: (settings: AppSettings) => void;
}

const DEFAULT_HIDE_OPTIONS: HideOptions = {
  hideAllLinks: false,
  hideGroupNames: false,
  hideSearchBox: false,
  hideButtons: false,
  hideDate: false,
  hideClock: false,
};

const ITEMS: Array<{ key: keyof HideOptions; label: string }> = [
  { key: 'hideClock', label: '数字时钟' },
  { key: 'hideDate', label: '当前日期' },
  { key: 'hideSearchBox', label: '搜索框' },
  { key: 'hideAllLinks', label: '全部链接' },
  { key: 'hideGroupNames', label: '分组名称' },
  { key: 'hideButtons', label: '功能按钮' },
];

export const DisplaySection: React.FC<DisplaySectionProps> = ({
  settings,
  theme,
  onSettingsChange,
}) => {
  const options = settings.hideOptions || DEFAULT_HIDE_OPTIONS;

  return (
    <section className="space-y-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>显示开关</h4>
      <div className="grid grid-cols-3 gap-3">
        {ITEMS.map((item) => {
          const isVisible = !options[item.key];
          return (
            <button key={item.key} onClick={() => onSettingsChange({ ...settings, hideOptions: { ...options, [item.key]: isVisible } })} className={`p-4 rounded-2xl border text-left ${isVisible ? 'border-blue-500 bg-blue-500/10' : theme === 'light' ? 'border-gray-200 bg-gray-100/60' : 'border-white/10 bg-white/5'}`}>
              <div className="text-sm font-bold">{item.label}</div>
              <div className="text-[11px] text-gray-500">{isVisible ? '显示' : '隐藏'}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
