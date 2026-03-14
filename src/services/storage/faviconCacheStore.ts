import { isExtensionEnvironment, readRawFromStorage, writeRawToStorage } from './envBridge';

declare const chrome: {
  storage?: {
    local?: {
      get: (keys: null, callback: (items: Record<string, unknown>) => void) => void;
      remove: (keys: string[], callback?: () => void) => void;
    };
  };
};

const FAVICON_CACHE_PREFIX = 'newtab_favicon_cache:';
const LEGACY_FAVICON_PREFIX = 'newtab_fav_';
const MAX_CACHED_ICON_LENGTH = 160 * 1024;

const normalizeCacheId = (pageUrl: string): string => {
  try {
    return new URL(pageUrl).hostname.toLowerCase();
  } catch {
    return pageUrl.trim().toLowerCase();
  }
};

const buildCacheKey = (pageUrl: string): string | null => {
  const cacheId = normalizeCacheId(pageUrl);
  return cacheId ? `${FAVICON_CACHE_PREFIX}${cacheId}` : null;
};

export const buildLegacyFaviconKey = (cacheId: string): string => `${LEGACY_FAVICON_PREFIX}${cacheId}`;

export const loadLegacyCachedFaviconSource = async (cacheId: string): Promise<string> => {
  if (!cacheId) {
    return '';
  }

  return await readRawFromStorage(buildLegacyFaviconKey(cacheId));
};

export const loadCachedFavicon = async (pageUrl: string): Promise<string> => {
  const key = buildCacheKey(pageUrl);
  if (!key) {
    return '';
  }

  const cached = await readRawFromStorage(key);
  return cached.startsWith('data:image/') ? cached : '';
};

export const saveCachedFavicon = async (pageUrl: string, dataUrl: string): Promise<void> => {
  if (!dataUrl.startsWith('data:image/') || dataUrl.length > MAX_CACHED_ICON_LENGTH) {
    return;
  }

  const key = buildCacheKey(pageUrl);
  if (!key) {
    return;
  }

  await writeRawToStorage(key, dataUrl);
};

const getLocalStorageKeysByPrefix = (prefix: string): string[] => {
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
};

export const clearCachedFavicons = async (): Promise<number> => {
  const localStorageKeys = [
    ...getLocalStorageKeysByPrefix(FAVICON_CACHE_PREFIX),
    ...getLocalStorageKeysByPrefix(LEGACY_FAVICON_PREFIX),
  ];

  localStorageKeys.forEach((key) => localStorage.removeItem(key));

  const runtimeChrome = typeof chrome !== 'undefined' ? chrome : undefined;
  const storageArea = runtimeChrome?.storage?.local;
  if (!isExtensionEnvironment() || !storageArea) {
    return localStorageKeys.length;
  }

  const extensionKeys = await new Promise<string[]>((resolve) => {
    storageArea.get(null, (items) => {
      const keys = Object.keys(items).filter((key) => key.startsWith(FAVICON_CACHE_PREFIX));
      resolve(keys);
    });
  });

  if (extensionKeys.length > 0) {
    await new Promise<void>((resolve) => {
      storageArea.remove(extensionKeys, () => resolve());
    });
  }

  return localStorageKeys.length + extensionKeys.length;
};
