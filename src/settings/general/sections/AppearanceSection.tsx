import type { AppSettings } from '@/types';
import { SettingSection } from '../../components/SettingSection';
import { Switch } from '@/shared/components/Switch';

interface AppearanceSectionProps {
  settings: AppSettings;
  theme: 'light' | 'dark';
  onSettingsChange: (settings: AppSettings) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  settings,
  theme,
  onSettingsChange,
}) => {
  const isLight = theme === 'light';

  return (
    <SettingSection title="外观与布局" theme={theme} accentColor="bg-purple-500">
      <div className="space-y-4">
        <label className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>展示模式</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSettingsChange({ ...settings, linkDisplayMode: 'scroll' })}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${settings.linkDisplayMode !== 'pagination'
              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
              : isLight
                ? 'border-gray-200 bg-white hover:border-purple-200'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
          >
            <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>滚动展示</div>
            <div className={`text-[11px] mt-0.5 font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>纵向滚动布局</div>
          </button>
          <button
            onClick={() => onSettingsChange({ ...settings, linkDisplayMode: 'pagination' })}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${settings.linkDisplayMode === 'pagination'
              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
              : isLight
                ? 'border-gray-200 bg-white hover:border-purple-200'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
          >
            <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>分页展示</div>
            <div className={`text-[11px] mt-0.5 font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>固定网格翻页</div>
          </button>
        </div>

      </div>

      <div
        className={`flex items-center justify-between p-4 px-5 rounded-2xl border transition-all duration-300 ${isLight
            ? 'border-gray-200 bg-white hover:border-purple-200 shadow-sm'
            : 'border-white/5 bg-white/5 hover:bg-white/[0.08]'
          }`}
      >
        <div className="flex-1 pr-4">
          <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>时钟显示秒数</div>
          <div className={`text-[11px] mt-0.5 font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>在顶部时钟显示动态秒数</div>
        </div>
        <Switch
          checked={!!settings.showSeconds}
          onChange={() => onSettingsChange({ ...settings, showSeconds: !settings.showSeconds })}
          theme={theme}
          accentColor="bg-purple-500"
        />
      </div>
    </SettingSection>
  );
};
