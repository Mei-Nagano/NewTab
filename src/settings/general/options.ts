import type { BgType, SearchEngine } from '@/types';

export interface BackgroundOption {
  value: BgType;
  label: string;
  desc: string;
}

export interface SearchEngineOption {
  value: SearchEngine;
  label: string;
  icon: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { value: 'bing', label: '必应每日', desc: '每天自动更新' },
  { value: 'random', label: '随机风景', desc: '每次刷新随机图片' },
  { value: 'custom', label: '自定义', desc: '手动输入或上传图片' },
];

export const SEARCH_ENGINE_OPTIONS: SearchEngineOption[] = [
  { value: 'google', label: 'Google', icon: 'https://www.google.com/favicon.ico' },
  { value: 'bing', label: 'Bing', icon: 'https://www.bing.com/favicon.ico' },
  { value: 'baidu', label: '百度', icon: 'https://www.baidu.com/favicon.ico' },
];
