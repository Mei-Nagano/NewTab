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
  collapsed?: boolean; // 是否折叠
  showTitle?: boolean; // 是否显示分组名（默认 true）
}

export type BgType = "bing" | "custom" | "random";
export type SearchEngine = "google" | "bing" | "baidu";
export type Theme = "dark" | "light";
export type LinkDisplayMode = "scroll" | "pagination";

export interface WebDavConfig {
  enabled: boolean;
  url: string;
  username: string;
  password: string;
}

// 隐藏选项
export interface HideOptions {
  hideAllLinks: boolean; // 隐藏所有网页
  hideGroupNames: boolean; // 隐藏分组名称
  hideSearchBox: boolean; // 隐藏搜索框
  hideButtons: boolean; // 隐藏按钮（设置和主题切换）
  hideDate: boolean; // 隐藏日期
  hideClock: boolean; // 隐藏时钟
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
