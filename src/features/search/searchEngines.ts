import type { SearchEngine } from '@/constants';

export interface SearchEngineOption {
  id: SearchEngine;
  label: string;
  icon: string;
}

export const SEARCH_ENGINES: SearchEngineOption[] = [
  { id: 'google', label: 'Google', icon: 'https://www.google.com/favicon.ico' },
  { id: 'bing', label: 'Bing', icon: 'https://www.bing.com/favicon.ico' },
  { id: 'baidu', label: '百度', icon: 'https://www.baidu.com/favicon.ico' },
];

export const getSearchEngineLabel = (engine: SearchEngine): string => {
  const option = SEARCH_ENGINES.find((item) => item.id === engine);
  return option?.label || 'Search';
};

export const getSearchEngineIcon = (engine: SearchEngine): string => {
  const option = SEARCH_ENGINES.find((item) => item.id === engine);
  return option?.icon || SEARCH_ENGINES[0].icon;
};

export const buildSearchUrl = (engine: SearchEngine, query: string): string => {
  const encoded = encodeURIComponent(query);
  if (engine === 'bing') return `https://www.bing.com/search?q=${encoded}`;
  if (engine === 'baidu') return `https://www.baidu.com/s?wd=${encoded}`;
  return `https://www.google.com/search?q=${encoded}`;
};
