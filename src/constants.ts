export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string; // Optional custom icon URL
}

export interface LinkGroup {
  id: string;
  title: string;
  links: Link[];
  collapsed?: boolean;    // 是否折叠
  showTitle?: boolean;    // 是否显示分组名（默认 true）
}

export type BgType = 'bing' | 'custom' | 'random';
export type SearchEngine = 'google' | 'bing' | 'baidu';
export type Theme = 'dark' | 'light';
export type LinkDisplayMode = 'scroll' | 'pagination';

export interface WebDavConfig {
  enabled: boolean;
  url: string;
  username: string;
  password: string;
}

// 隐藏选项
export interface HideOptions {
  hideAllLinks: boolean;      // 隐藏所有网页
  hideGroupNames: boolean;    // 隐藏分组名称
  hideSearchBox: boolean;     // 隐藏搜索框
  hideButtons: boolean;       // 隐藏按钮（设置和主题切换）
  hideDate: boolean;          // 隐藏日期
  hideClock: boolean;         // 隐藏时钟
}

export interface AppSettings {
  bgType: BgType;
  customBgUrl: string;
  bgBlur: boolean;
  bgBlurAmount?: number;
  searchEngine: SearchEngine;
  groups: LinkGroup[];
  theme: Theme;
  webdav: WebDavConfig;
  hideOptions?: HideOptions;
  showSeconds?: boolean;
  enableDarkMask: boolean;
  darkMaskOpacity?: number;
  linkDisplayMode?: LinkDisplayMode;
}

export const DEFAULT_LINKS: Link[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com' },
  { id: '2', title: 'YouTube', url: 'https://www.youtube.com' },
  { id: '3', title: 'GitHub', url: 'https://github.com' },
  { id: '4', title: 'Bilibili', url: 'https://www.bilibili.com' },
];

export const DEFAULT_GROUPS: LinkGroup[] = [
  {
    id: 'g-default',
    title: '常用',
    links: DEFAULT_LINKS
  }
];

export const DEFAULT_WEBDAV: WebDavConfig = {
  enabled: false,
  url: '',
  username: '',
  password: ''
};

export const DEFAULT_SETTINGS: AppSettings = {
  bgType: 'bing',
  customBgUrl: '',
  bgBlur: false,
  bgBlurAmount: 8,
  searchEngine: 'bing',
  groups: DEFAULT_GROUPS,
  theme: 'dark',
  showSeconds: false,
  enableDarkMask: true,
  darkMaskOpacity: 40,
  linkDisplayMode: 'scroll',
  webdav: DEFAULT_WEBDAV,
};

export const APP_VERSION = '1.1.0';