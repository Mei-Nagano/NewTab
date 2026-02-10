import type { AppSettings, Link, LinkGroup, WebDavConfig } from './types';

export const DEFAULT_LINKS: Link[] = [
  { id: "1", title: "Google", url: "https://www.google.com" },
  { id: "2", title: "YouTube", url: "https://www.youtube.com" },
  { id: "3", title: "GitHub", url: "https://github.com" },
  { id: "4", title: "Bilibili", url: "https://www.bilibili.com" },
];

export const DEFAULT_GROUPS: LinkGroup[] = [
  {
    id: "g-default",
    title: "常用",
    links: DEFAULT_LINKS,
  },
];

export const DEFAULT_WEBDAV: WebDavConfig = {
  enabled: false,
  url: "",
  username: "",
  password: "",
};

export const DEFAULT_SETTINGS: AppSettings = {
  bgType: "bing",
  customBgUrl: "",
  bgBlur: false,
  bgBlurAmount: 8,
  searchEngine: "bing",
  groups: DEFAULT_GROUPS,
  theme: "dark",
  showSeconds: false,
  enableDarkMask: true,
  darkMaskOpacity: 40,
  linkDisplayMode: "scroll",
  webdav: DEFAULT_WEBDAV,
};

export const APP_VERSION = __APP_VERSION__;

export * from './types';
