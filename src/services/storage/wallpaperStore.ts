import { isExtensionEnvironment } from './envBridge';

export const fetchBingWallpaper = async (): Promise<string> => {
  const root = isExtensionEnvironment() ? 'https://www.bing.com' : '/bing-api';
  const api = `${root}/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`;

  try {
    const response = await fetch(api);
    const data = await response.json();
    if (data?.images?.length) {
      return `https://www.bing.com${data.images[0].url}`;
    }
  } catch (error) {
    console.error('获取必应壁纸失败:', error);
  }

  return '/default-wallpaper.jpg';
};

export const fetchRandomWallpaper = async (): Promise<string> => {
  const timestamp = Date.now();
  return `https://picsum.photos/1920/1080?random=${timestamp}`;
};
