import { type AppSettings, DEFAULT_SETTINGS, type Link } from '../constants';

declare var chrome: any;

// 检查是否在Chrome扩展环境中
const isExtension = () => {
  return typeof chrome !== 'undefined' && !!chrome.storage;
};

// 加载设置
export const loadSettings = async (): Promise<AppSettings> => {
  if (isExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result: any) => {
        if (result.settings) {
          const settings = result.settings;
          // 迁移：将旧版links转换为groups
          if ((settings as any).links && (!settings.groups || settings.groups.length === 0)) {
            settings.groups = [{
              id: 'g-migrated',
              title: '常用',
              links: (settings as any).links
            }];
            delete (settings as any).links;
          }
          resolve({ ...DEFAULT_SETTINGS, ...settings });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      });
    });
  } else {
    // 开发环境降级使用LocalStorage
    const stored = localStorage.getItem('newtab_settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        // LocalStorage也需要迁移
        if (settings.links && (!settings.groups || settings.groups.length === 0)) {
          settings.groups = [{
            id: 'g-migrated',
            title: '常用',
            links: settings.links
          }];
          delete settings.links;
        }
        return { ...DEFAULT_SETTINGS, ...settings };
      } catch (e) {
        console.error("从localStorage解析设置失败", e);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }
};

// 保存设置
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  if (isExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ settings }, () => resolve());
    });
  } else {
    localStorage.setItem('newtab_settings', JSON.stringify(settings));
  }
};

// 获取必应壁纸
export const fetchBingWallpaper = async (): Promise<string> => {
  // 开发环境下使用 Vite 代理，生成环境下使用完整路径
  const BING_ROOT = isExtension() ? 'https://www.bing.com' : '/bing-api';
  const BING_API = `${BING_ROOT}/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`;

  try {
    const response = await fetch(BING_API);
    const data = await response.json();
    if (data && data.images && data.images.length > 0) {
      return `https://www.bing.com${data.images[0].url}`;
    }
  } catch (error) {
    console.error("获取必应壁纸失败:", error);
  }

  // API请求失败或网络问题时的降级图片
  // 如果需要使用本地图片，请将图片放入 public 文件夹（例如命名为 default-wallpaper.jpg）
  return '/default-wallpaper.jpg';
};

// 获取随机壁纸
export const fetchRandomWallpaper = async (): Promise<string> => {
  // 使用Lorem Picsum API获取随机壁纸
  // 这是一个可靠的免费API，无需认证
  // 每次请求返回不同的随机图片
  const PICSUM_RANDOM_API = 'https://picsum.photos/1920/1080';

  try {
    // Lorem Picsum自动重定向到随机图片
    // 添加时间戳确保每次获取新图片
    const timestamp = new Date().getTime();
    return `${PICSUM_RANDOM_API}?random=${timestamp}`;
  } catch (error) {
    console.error("获取随机壁纸失败:", error);
    // 降级到默认图片
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop';
  }
};

// 获取浏览器书签
export const getBrowserBookmarks = async (): Promise<Link[]> => {
  if (!isExtension()) {
    console.warn("书签API在非扩展环境中不可用");
    // 开发环境返回空数组防止崩溃
    return [];
  }

  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree: any[]) => {
      const links: Link[] = [];

      const processNode = (node: any) => {
        if (node.url) {
          links.push({
            id: `bm-${node.id}`,
            title: node.title,
            url: node.url
          });
        }
        if (node.children) {
          node.children.forEach(processNode);
        }
      };

      if (tree && tree.length > 0) {
        const root = tree[0];
        if (root.children) {
          root.children.forEach(processNode);
        } else {
          processNode(root);
        }
      }

      resolve(links);
    });
  });
};

// 导出设置到JSON文件
export const exportSettingsToFile = (settings: AppSettings): void => {
  try {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `newtab-backup-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error("导出设置失败:", error);
    throw new Error("导出设置失败");
  }
};

// 从文件导入设置
export const importSettingsFromFile = (): Promise<AppSettings> => {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) {
        reject(new Error("未选择文件"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const content = e.target.result;
          const importedSettings = JSON.parse(content);

          // 验证导入的数据是否有效
          if (!importedSettings || typeof importedSettings !== 'object') {
            throw new Error("无效的设置文件");
          }

          // 确保导入的数据包含必要的属性
          const validatedSettings = {
            ...DEFAULT_SETTINGS,
            ...importedSettings
          };

          resolve(validatedSettings);
        } catch (error) {
          console.error("解析导入的设置失败:", error);
          reject(new Error("解析设置文件失败"));
        }
      };

      reader.onerror = () => {
        reject(new Error("读取文件失败"));
      };

      reader.readAsText(file);
    };

    fileInput.click();
  });
};