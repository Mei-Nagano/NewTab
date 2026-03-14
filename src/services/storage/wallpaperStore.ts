import { isExtensionEnvironment, readFromStorage, writeToStorage } from './envBridge';

const BING_HOST = 'https://www.bing.com';
const BING_PROXY_ROOT = '/bing-api';
const BING_API_PATH = '/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN';
const DEFAULT_WALLPAPER = '/default-wallpaper.jpg';
const PICSUM_RANDOM_WALLPAPER = 'https://picsum.photos/1920/1080';
const BING_CACHE_KEY = 'newtab_bing_wallpaper_cache';
const WALLPAPER_FAVORITES_KEY = 'newtab_wallpaper_favorites';
const MAX_WALLPAPER_FAVORITES = 24;

export interface FavoriteWallpaper {
  id: string;
  image: string;
  addedAt: string;
}

interface BingWallpaperCache {
  date: string;
  image: string;
}

interface BingWallpaperApiResponse {
  images?: Array<{
    url?: string;
  }>;
}

const toLocalDateKey = (value: Date = new Date()): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const blobToDataUrl = async (blob: Blob): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read wallpaper blob.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read wallpaper blob.'));
    reader.readAsDataURL(blob);
  });
};

const fetchImageAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch wallpaper image: ${response.status}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error('Wallpaper image is empty.');
  }

  if (blob.type && !blob.type.toLowerCase().startsWith('image/')) {
    throw new Error('Wallpaper response is not an image.');
  }

  return await blobToDataUrl(blob);
};

const resolveBingImageUrl = (relativeUrl: string): string => {
  const normalizedPath = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  const root = isExtensionEnvironment() ? BING_HOST : BING_PROXY_ROOT;
  return `${root}${normalizedPath}`;
};

const readBingCache = async (): Promise<BingWallpaperCache | undefined> => {
  return await readFromStorage<BingWallpaperCache>(BING_CACHE_KEY);
};

const writeBingCache = async (cache: BingWallpaperCache): Promise<void> => {
  await writeToStorage(BING_CACHE_KEY, cache);
};

const normalizeWallpaperForStorage = async (image: string): Promise<string> => {
  if (!image) {
    return '';
  }
  if (image.startsWith('data:image/')) {
    return image;
  }

  return await fetchImageAsDataUrl(image);
};

export const fetchBingWallpaper = async (): Promise<string> => {
  const today = toLocalDateKey();
  const cached = await readBingCache();
  if (cached?.date === today && cached.image.startsWith('data:image/')) {
    return cached.image;
  }

  const apiRoot = isExtensionEnvironment() ? BING_HOST : BING_PROXY_ROOT;
  const api = `${apiRoot}${BING_API_PATH}`;

  try {
    const response = await fetch(api);
    const data = (await response.json()) as BingWallpaperApiResponse;
    const relativeUrl = data.images?.[0]?.url;
    if (!relativeUrl) {
      return DEFAULT_WALLPAPER;
    }

    const image = await fetchImageAsDataUrl(resolveBingImageUrl(relativeUrl));
    await writeBingCache({ date: today, image });
    return image;
  } catch {
    return DEFAULT_WALLPAPER;
  }
};

export const fetchRandomWallpaper = async (): Promise<string> => {
  const timestamp = Date.now();

  try {
    return await fetchImageAsDataUrl(`${PICSUM_RANDOM_WALLPAPER}?random=${timestamp}`);
  } catch {
    return DEFAULT_WALLPAPER;
  }
};

export const listFavoriteWallpapers = async (): Promise<FavoriteWallpaper[]> => {
  const favorites = await readFromStorage<FavoriteWallpaper[]>(WALLPAPER_FAVORITES_KEY);
  return Array.isArray(favorites) ? favorites : [];
};

export const saveFavoriteWallpaper = async (image: string): Promise<'added' | 'exists' | 'failed'> => {
  try {
    const normalizedImage = await normalizeWallpaperForStorage(image);
    if (!normalizedImage) {
      return 'failed';
    }

    const favorites = await listFavoriteWallpapers();
    if (favorites.some((item) => item.image === normalizedImage)) {
      return 'exists';
    }

    const nextFavorites: FavoriteWallpaper[] = [
      {
        id: `wallpaper-${Date.now()}`,
        image: normalizedImage,
        addedAt: new Date().toISOString(),
      },
      ...favorites,
    ].slice(0, MAX_WALLPAPER_FAVORITES);

    await writeToStorage(WALLPAPER_FAVORITES_KEY, nextFavorites);
    return 'added';
  } catch {
    return 'failed';
  }
};

export const removeFavoriteWallpaper = async (id: string): Promise<void> => {
  const favorites = await listFavoriteWallpapers();
  await writeToStorage(
    WALLPAPER_FAVORITES_KEY,
    favorites.filter((item) => item.id !== id)
  );
};
