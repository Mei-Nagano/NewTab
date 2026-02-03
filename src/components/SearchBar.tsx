import React, { useState, type FormEvent, useRef, useEffect } from 'react';
import type { SearchEngine, Theme } from '../constants';

interface SearchBarProps {
  engine: SearchEngine;
  onEngineChange: (engine: SearchEngine) => void;
  theme: Theme;
}

// 定义备用图标映射（使用Base64内嵌图标）
const ENGINE_ICON_FALLBACK: Record<SearchEngine, string> = {
  google: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJBMTAgMTAgMCAwIDEgMjIgMTJBMTAgMTAgMCAwIDEgMTIgMjJBMTAgMTAgMCAwIDEgMiAxMkExMCAxMCAwIDAgMCAxMiAyWiIgZmlsbD0iIzQwODBGMCIvPjxwYXRoIGQ9Ik0xNy41IDE0LjVjLTEuNiAxLjUtNCAyLjQtNi41IDIuNC00LjcgMC04LjUtMy44LTguNS04LjVzMy44LTguNSA4LjUtOC41czguNSAzLjggOC41IDguNXMtMy44IDguNS04LjUgOC41YzAtMS4xIDAtMi4xLjMtMy4xTDIyIDE3YzAgMS42LTEuMyAzLTMgM3gtMmMtMS43IDAtMy0xLjMtMy0zVjVjMC0xLjcgMS4zLTMgMy0zaDJjMS42IDAgMyAxLjMgMyAzbC00LjUgM3oiIGZpbGw9IiM0MDgwRjAiLz48L3N2Zz4=',
  bing: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJBMTAgMTAgMCAwIDEgMjIgMTJBMTAgMTAgMCAwIDEgMTIgMjJBMTAgMTAgMCAwIDEgMiAxMkExMCAxMCAwIDAgMCAxMiAyWiIgZmlsbD0iIzM5NzFEQiIvPjxwYXRoIGQ9Ik0xMiA0QzguNyA0IDYgNi43IDYgMTBzMi43IDYgNiA2czYtMi43IDYtNnMtMi43LTYtNi02ek0xMiAxNnYtMmgtMnYyaC0ydi0yaDJ2LTIgaDJ2Mmgydi0yaC0yek0xMiA5YzEuMSAwIDIgLjkgMiAycy0uOSAyLTIgMnMtMi0uOS0yLTJzLjktMiAyLTJ6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
  baidu: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJBMTAgMTAgMCAwIDEgMjIgMTJBMTAgMTAgMCAwIDEgMTIgMjJBMTAgMTAgMCAwIDEgMiAxMkExMCAxMCAwIDAgMCAxMiAyWiIgZmlsbD0iIzFFNzQyOCIvPjxwYXRoIGQ9Ik0xMiA0QzguNyA0IDYgNi43IDYgMTBzMi43IDYgNiA2czYtMi43IDYtNnMtMi43LTYtNi02ek0xMiAxNnYtMmgtMnYyaC0ydi0yaDJ2LTIgaDJ2Mmgydi0yaC0yek0xMiA5YzEuMSAwIDIgLjkgMiAycy0uOSAyLTIgMnMtMi0uOS0yLTJzLjktMiAyLTJ6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=='
};

export const SearchBar: React.FC<SearchBarProps> = ({ engine, onEngineChange, theme }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  const engines: SearchEngine[] = ['google', 'bing', 'baidu'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let url = '';
    switch (engine) {
      case 'bing':
        url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'baidu':
        url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
        break;
      case 'google':
      default:
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
    }
    window.location.href = url;
  };

  const getEngineName = (e: SearchEngine) => {
    switch (e) {
      case 'bing': return 'Bing';
      case 'baidu': return '百度';
      case 'google': default: return 'Google';
    }
  };

  // 优化：优先使用国内CDN，失败则自动切换到Base64内嵌图标
  const getIconUrl = (e: SearchEngine) => {
    const cdnUrls: Record<SearchEngine, string> = {
      bing: 'https://img.icons8.com/fluency/64/bing.png', // 国内可访问的icons8 CDN
      baidu: 'https://www.baidu.com/favicon.ico', // 百度官方（保留）
      google: 'https://img.icons8.com/fluency/64/google-logo.png' // 国内可访问的icons8 CDN
    };
    // 返回CDN地址，img标签的onError会自动切换到fallback
    return cdnUrls[e];
  };

  // 新增：处理图标加载失败的回调
  const handleIconError = (e: React.SyntheticEvent<HTMLImageElement>, engine: SearchEngine) => {
    e.currentTarget.src = ENGINE_ICON_FALLBACK[engine];
  };

  // Theme styles
  const isLight = theme === 'light';

  const containerBaseClass = isLight
    ? 'bg-white/60 backdrop-blur-xl hover:bg-white/80 border border-white/40 shadow-lg shadow-gray-200/50'
    : 'bg-black/20 backdrop-blur-xl hover:bg-black/30 border border-white/5 shadow-lg shadow-black/20';

  const containerFocusClass = isLight
    ? 'bg-white shadow-xl shadow-blue-500/10 scale-[1.02] border-white/60'
    : 'bg-gray-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02] border-white/10';

  const inputClass = isFocused || isDropdownOpen
    ? (isLight ? 'text-slate-800 placeholder-slate-400' : 'text-gray-100 placeholder-gray-500')
    : (isLight ? 'text-slate-700 placeholder-slate-500' : 'text-white/90 placeholder-white/30');

  const buttonClass = isFocused
    ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
    : (isLight ? 'text-gray-600 hover:text-gray-900' : 'text-white/70 hover:text-white');

  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className="w-full max-w-lg relative z-20"
    >
      <div className={`
        relative flex items-center w-full h-12 rounded-full px-2 gap-2
        transition-all duration-300 ease-out
        ${isFocused || isDropdownOpen ? containerFocusClass : containerBaseClass}
      `}>
        {/* Search Engine Selector Button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
          title="Change Search Engine"
        >
          <img
            src={getIconUrl(engine)}
            alt={engine}
            className="w-5 h-5 object-contain opacity-90"
            onError={(e) => handleIconError(e, engine)} // 新增：加载失败降级
          />
        </button>

        {isDropdownOpen && (
          <div className={`absolute top-14 left-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-36 py-2 animate-slide-up z-30 ${isLight ? 'bg-white/80 backdrop-blur-xl border border-white/60' : 'bg-gray-900/90 backdrop-blur-xl border border-white/10'
            }`}>
            {engines.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  onEngineChange(e);
                  setIsDropdownOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors w-full text-left
                  ${engine === e
                    ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400')
                    : (isLight ? 'text-slate-600 hover:bg-black/5' : 'text-gray-300 hover:bg-white/5')
                  }
                `}
              >
                <img
                  src={getIconUrl(e)}
                  alt={e}
                  className="w-4 h-4 object-contain"
                  onError={(ev) => handleIconError(ev, e)} // 新增：加载失败降级
                />
                {getEngineName(e)}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`在 ${getEngineName(engine)} 上搜索...`}
          className={`
            flex-1 h-full bg-transparent border-none outline-none
            text-lg transition-colors duration-300 pt-0.5
            ${inputClass}
          `}
        />
        <button
          type="submit"
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${buttonClass}`}
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </form>
  );
};