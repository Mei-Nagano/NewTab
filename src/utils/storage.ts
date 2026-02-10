import { DEFAULT_SETTINGS } from '../constants';
import type { AppSettings, Link } from '../types';

declare const chrome: any;


// 检查是否在Chrome扩展环境中
const isExtension = () => {
  return typeof chrome !== 'undefined' && !!chrome.storage;
};

// 内部常量：用于标识本地存储的图片数据
const LOCAL_IMAGE_FLAG = '[LOCAL_IMAGE]';
const IMAGE_STORAGE_KEY = 'newtab_custom_bg_data';

// 加载设置
export const loadSettings = async (): Promise<AppSettings> => {
  let settings: AppSettings;

  if (isExtension()) {
    const result = await new Promise<any>((resolve) => {
      chrome.storage.local.get(['settings'], resolve);
    });
    settings = result.settings ? { ...DEFAULT_SETTINGS, ...result.settings } : DEFAULT_SETTINGS;
  } else {
    const stored = localStorage.getItem('newtab_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        settings = { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        console.error("从localStorage解析设置失败", e);
        settings = DEFAULT_SETTINGS;
      }
    } else {
      settings = DEFAULT_SETTINGS;
    }
  }

  // 迁移：旧版 links -> groups (保持原有逻辑)
  if ((settings as any).links && (!settings.groups || settings.groups.length === 0)) {
    settings.groups = [{
      id: 'g-migrated',
      title: '常用',
      links: (settings as any).links
    }];
    delete (settings as any).links;
  }

  // 处理分离存储的图片数据
  if (settings.customBgUrl === LOCAL_IMAGE_FLAG) {
    if (isExtension()) {
      const imgResult = await new Promise<any>((resolve) => {
        chrome.storage.local.get([IMAGE_STORAGE_KEY], resolve);
      });
      settings.customBgUrl = imgResult[IMAGE_STORAGE_KEY] || '';
    } else {
      settings.customBgUrl = localStorage.getItem(IMAGE_STORAGE_KEY) || '';
    }
  }

  return settings;
};

// 保存设置
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  // 为了不影响内存中的状态，我们克隆一份设置用于存储
  const settingsToSave = { ...settings };
  let imageData = '';

  // 如果 customBgUrl 是 Base64 数据，将其分离
  if (settings.customBgUrl?.startsWith('data:')) {
    imageData = settings.customBgUrl;
    settingsToSave.customBgUrl = LOCAL_IMAGE_FLAG;
  }

  if (isExtension()) {
    const storageData: any = { settings: settingsToSave };
    if (imageData) {
      storageData[IMAGE_STORAGE_KEY] = imageData;
    }
    return new Promise((resolve) => {
      chrome.storage.local.set(storageData, () => resolve());
    });
  } else {
    localStorage.setItem('newtab_settings', JSON.stringify(settingsToSave));
    if (imageData) {
      localStorage.setItem(IMAGE_STORAGE_KEY, imageData);
    } else if (settings.customBgUrl !== LOCAL_IMAGE_FLAG) {
      // 如果不是本地图片且不是占位符，清理掉旧的图片存储
      localStorage.removeItem(IMAGE_STORAGE_KEY);
    }
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
    // 导出时克隆数据并移除图片数据
    const exportData = { ...settings };
    if (exportData.customBgUrl?.startsWith('data:')) {
      exportData.customBgUrl = ''; // 导出文件中排除 Base64 图片
    }

    const dataStr = JSON.stringify(exportData, null, 2);
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