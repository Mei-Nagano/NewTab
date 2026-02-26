import { isExtensionEnvironment } from './envBridge';

const BING_HOST = 'https://www.bing.com';
const BING_API_PATH = '/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN';
const DEFAULT_WALLPAPER = '/default-wallpaper.jpg';
const PICSUM_RANDOM_WALLPAPER = 'https://picsum.photos/1920/1080';

export const fetchBingWallpaper = async (): Promise<string> => {
  const root = isExtensionEnvironment() ? BING_HOST : '/bing-api';
  const api = `${root}${BING_API_PATH}`;

  try {
    const response = await fetch(api);
    const data = await response.json();
    if (data?.images?.length) {
      return `${BING_HOST}${data.images[0].url}`;
    }
    return DEFAULT_WALLPAPER;
  } catch (_error) {
    // Fallback is intentional; transient network failures should not block rendering.
    return DEFAULT_WALLPAPER;
  }
};

export const fetchRandomWallpaper = (): string => {
  const timestamp = Date.now();
  return `${PICSUM_RANDOM_WALLPAPER}?random=${timestamp}`;
};
