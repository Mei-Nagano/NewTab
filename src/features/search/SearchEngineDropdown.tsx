import type { SearchEngine, Theme } from '@/constants';
import { SEARCH_ENGINES, getSearchEngineIcon } from './searchEngines';

interface SearchEngineDropdownProps {
  engine: SearchEngine;
  theme: Theme;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (engine: SearchEngine) => void;
}

export const SearchEngineDropdown: React.FC<SearchEngineDropdownProps> = ({
  engine,
  theme,
  isOpen,
  onToggle,
  onSelect,
}) => {
  const isLight = theme === 'light';

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
        title="切换搜索引擎"
      >
        <img src={getSearchEngineIcon(engine)} alt={engine} className="w-5 h-5 object-contain opacity-90" />
      </button>

      {isOpen && (
        <div
          className={`absolute top-14 left-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-36 py-2 animate-slide-up z-30 ${
            isLight ? 'bg-white/80 backdrop-blur-xl border border-white/60' : 'bg-gray-900/90 backdrop-blur-xl border border-white/10'
          }`}
        >
          {SEARCH_ENGINES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors w-full text-left ${
                engine === item.id
                  ? isLight
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-blue-500/10 text-blue-400'
                  : isLight
                    ? 'text-slate-600 hover:bg-black/5'
                    : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <img src={item.icon} alt={item.label} className="w-4 h-4 object-contain" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};
