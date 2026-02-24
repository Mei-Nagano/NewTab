import type { AppSettings, HideOptions } from '@/types';
import { SettingSection } from '../../components/SettingSection';
import { Switch } from '@/shared/components/Switch';

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

const ITEMS: Array<{ key: keyof HideOptions; label: string; desc: string }> = [
  { key: 'hideClock', label: '数字时钟', desc: '显示或隐藏页面顶部的数字时钟' },
  { key: 'hideDate', label: '当前日期', desc: '显示或隐藏页面顶部的当前日期' },
  { key: 'hideSearchBox', label: '搜索框', desc: '显示或隐藏页面中央的搜索引擎搜索框' },
  { key: 'hideAllLinks', label: '全部链接', desc: '显示或隐藏所有已添加的网站链接' },
  { key: 'hideGroupNames', label: '分组名称', desc: '显示或隐藏链接分组的标题文字' },
  { key: 'hideButtons', label: '功能按钮', desc: '显示或隐藏右下角的功能设置按钮' },
];

export const DisplaySection: React.FC<DisplaySectionProps> = ({
  settings,
  theme,
  onSettingsChange,
}) => {
  const options = settings.hideOptions || DEFAULT_HIDE_OPTIONS;
  const isLight = theme === 'light';

  return (
    <SettingSection title="显示开关" theme={theme} accentColor="bg-emerald-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ITEMS.map((item) => {
          const isVisible = !options[item.key];
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between p-4 px-5 rounded-2xl border transition-all duration-300 ${isLight
                  ? 'border-gray-200 bg-white hover:border-emerald-200 shadow-sm'
                  : 'border-white/5 bg-white/5 hover:bg-white/[0.08]'
                }`}
            >
              <div className="flex-1 pr-4">
                <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                  {item.label}
                </div>
                <div className={`text-[11px] mt-0.5 font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {item.desc}
                </div>
              </div>
              <Switch
                checked={isVisible}
                onChange={() => onSettingsChange({ ...settings, hideOptions: { ...options, [item.key]: isVisible } })}
                theme={theme}
                accentColor="bg-emerald-500"
              />
            </div>
          );
        })}
      </div>
    </SettingSection>
  );
};
