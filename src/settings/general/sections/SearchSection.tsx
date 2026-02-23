import type { AppSettings } from '@/types';
import { SEARCH_ENGINE_OPTIONS } from '../options';

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
    <section className="space-y-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>搜索引擎</h4>
      <div className="grid grid-cols-3 gap-3">
        {SEARCH_ENGINE_OPTIONS.map((engine) => (
          <button key={engine.value} onClick={() => onSettingsChange({ ...settings, searchEngine: engine.value })} className={`flex items-center gap-3 p-4 rounded-2xl border text-left ${settings.searchEngine === engine.value ? 'border-blue-500 bg-blue-500/10' : theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>
            <img src={engine.icon} alt={engine.label} className="w-5 h-5" />
            <span className="font-bold text-sm">{engine.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
