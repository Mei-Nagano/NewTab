import type { AppSettings } from '@/types';
import { SEARCH_ENGINE_OPTIONS } from '../options';
import { SettingSection } from '../../components/SettingSection';

interface SearchSectionProps {
  settings: AppSettings;
  theme: 'light' | 'dark';
  onSettingsChange: (settings: AppSettings) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  settings,
  theme,
  onSettingsChange,
}) => {
  return (
    <SettingSection title="搜索引擎" theme={theme} accentColor="bg-orange-500">
      <div className="grid grid-cols-3 gap-3">
        {SEARCH_ENGINE_OPTIONS.map((engine) => (
          <button
            key={engine.value}
            onClick={() => onSettingsChange({ ...settings, searchEngine: engine.value })}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${settings.searchEngine === engine.value
              ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
              : theme === 'light'
                ? 'border-gray-200 bg-white hover:border-orange-300'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
          >
            <img src={engine.icon} alt={engine.label} className="w-5 h-5" />
            <span className="font-bold text-sm">{engine.label}</span>
          </button>
        ))}
      </div>
    </SettingSection>
  );
};
