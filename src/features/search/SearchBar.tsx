import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SearchEngine, Theme } from '@/constants';
import { SearchEngineDropdown } from './SearchEngineDropdown';
import { SearchInput } from './SearchInput';
import { buildSearchUrl, getSearchEngineLabel } from './searchEngines';

interface SearchBarProps {
  engine: SearchEngine;
  onEngineChange: (engine: SearchEngine) => void;
  theme: Theme;
}

const getInputClass = (isLight: boolean, isFocused: boolean, isDropdownOpen: boolean): string => {
  const isActive = isFocused || isDropdownOpen;
  if (isActive) {
    return isLight
      ? 'text-slate-800 placeholder-slate-400'
      : 'text-gray-100 placeholder-gray-500';
  }
  return isLight
    ? 'text-slate-700 placeholder-slate-500'
    : 'text-white/90 placeholder-white/30';
};

const getButtonClass = (isLight: boolean, isFocused: boolean): string => {
  if (isFocused) return 'text-gray-500 hover:text-blue-600 hover:bg-blue-50';
  return isLight
    ? 'text-gray-600 hover:text-gray-900'
    : 'text-white/70 hover:text-white';
};

export const SearchBar: React.FC<SearchBarProps> = ({ engine, onEngineChange, theme }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const nextUrl = new URL(buildSearchUrl(engine, trimmed));
    if (nextUrl.protocol !== 'https:') return;
    globalThis.location.assign(nextUrl.toString());
  };

  const isLight = theme === 'light';
  const focusClass = isLight
    ? 'bg-white shadow-xl shadow-blue-500/10 scale-[1.02] border-white/60'
    : 'bg-gray-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02] border-white/10';
  const baseClass = isLight
    ? 'bg-white/60 backdrop-blur-xl hover:bg-white/80 border border-white/40 shadow-lg shadow-gray-200/50'
    : 'bg-black/20 backdrop-blur-xl hover:bg-black/30 border border-white/5 shadow-lg shadow-black/20';
  const inputClass = getInputClass(isLight, isFocused, isDropdownOpen);
  const buttonClass = getButtonClass(isLight, isFocused);

  return (
    <form ref={containerRef} onSubmit={handleSubmit} className="w-full max-w-lg relative z-20">
      <div
        className={`relative flex items-center w-full h-12 rounded-full px-2 gap-2 transition-all duration-300 ease-out ${
          isFocused || isDropdownOpen ? focusClass : baseClass
        }`}
      >
        <SearchEngineDropdown
          engine={engine}
          theme={theme}
          isOpen={isDropdownOpen}
          onToggle={() => setIsDropdownOpen((prev) => !prev)}
          onSelect={(nextEngine) => {
            onEngineChange(nextEngine);
            setIsDropdownOpen(false);
          }}
        />
        <SearchInput
          query={query}
          placeholder={`在 ${getSearchEngineLabel(engine)} 上搜索...`}
          inputClass={inputClass}
          buttonClass={buttonClass}
          onQueryChange={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </form>
  );
};
