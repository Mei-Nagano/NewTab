import type { AppSettings, WebDavConfig } from '../constants';

const FILENAME = 'newtab-backup.json';

// 生成WebDAV认证头
const getAuthHeader = (config: WebDavConfig) => {
  // 使用encodeURIComponent + unescape处理UTF-8字符
  // 标准btoa只接受Latin1编码
  const str = `${config.username}:${config.password}`;
  const safeStr = unescape(encodeURIComponent(str));
  return 'Basic ' + btoa(safeStr);
};

// 规范化URL，确保以文件名结尾
const normalizeUrl = (url: string) => {
  let normalized = url.trim();
  if (!normalized.endsWith('/')) {
    normalized += '/';
  }
  return normalized + FILENAME;
};

// 清理设置数据用于备份（移除敏感的WebDAV凭据）
const cleanSettingsForBackup = (settings: AppSettings): Partial<AppSettings> => {
  // 从备份文件中移除webdav配置，避免凭据泄露
  const { webdav, ...rest } = settings;
  return rest;
};

// 检查WebDAV连接
export const checkWebDavConnection = async (config: WebDavConfig): Promise<boolean> => {
  const url = config.url.trim();

  try {
    const response = await fetch(url, {
      method: 'PROPFIND',
      headers: {
        'Authorization': getAuthHeader(config),
        'Depth': '0'
      }
    });
    return response.status < 500 && response.status !== 401;
  } catch (e) {
    console.error("WebDAV连接检查失败:", e);
    return false;
  }
};

// 确保目录存在，不存在则创建
const ensureDirectoryExists = async (baseUrl: string, config: WebDavConfig): Promise<void> => {
  const dirUrl = baseUrl.trim().endsWith('/') ? baseUrl.trim() : baseUrl.trim() + '/';

  try {
    // 使用PROPFIND检查目录是否存在
    const checkResponse = await fetch(dirUrl, {
      method: 'PROPFIND',
      headers: {
        'Authorization': getAuthHeader(config),
        'Depth': '0'
      }
    });

    // 目录存在（2xx）或返回207 Multi-Status
    if (checkResponse.ok || checkResponse.status === 207) {
      return;
    }

    // 404表示不存在，尝试创建目录
    if (checkResponse.status === 404) {
      const createResponse = await fetch(dirUrl, {
        method: 'MKCOL',
        headers: {
          'Authorization': getAuthHeader(config)
        }
      });

      if (!createResponse.ok && createResponse.status !== 405) {
        // 405表示目录已存在（方法不允许）
        throw new Error(`创建目录失败: ${createResponse.status}`);
      }
      return;
    }

    // 其他错误
    if (checkResponse.status === 401) {
      throw new Error("认证失败 - 请检查用户名和密码");
    }

  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("验证/创建目录失败");
  }
};

// 备份到WebDAV
export const backupToWebDav = async (settings: AppSettings): Promise<void> => {
  if (!settings.webdav.url) throw new Error("WebDAV URL未设置");

  // 首先确保目录存在
  try {
    await ensureDirectoryExists(settings.webdav.url, settings.webdav);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`目录检查失败: ${error.message}`);
    }
    throw error;
  }

  const url = normalizeUrl(settings.webdav.url);
  const payload = JSON.stringify(cleanSettingsForBackup(settings), null, 2);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': getAuthHeader(settings.webdav),
      'Content-Type': 'application/json'
    },
    body: payload
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("认证失败(401) - 请检查用户名和密码");
    if (response.status === 404) throw new Error("路径未找到(404) - 请检查WebDAV路径是否正确");
    if (response.status === 409) throw new Error("冲突(409) - 父目录可能不存在");
    throw new Error(`备份失败，状态码: ${response.status}`);
  }
};

// 从WebDAV恢复
export const restoreFromWebDav = async (config: WebDavConfig): Promise<Partial<AppSettings>> => {
  if (!config.url) throw new Error("WebDAV URL未设置");

  const url = normalizeUrl(config.url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(config),
      'Cache-Control': 'no-cache'
    }
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error("服务器上未找到备份文件");
    if (response.status === 401) throw new Error("认证失败(401) - 请检查用户名和密码");
    throw new Error(`恢复失败，状态码: ${response.status}`);
  }

  const data = await response.json();
  return data;
};