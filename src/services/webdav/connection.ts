import type { WebDavConfig } from '@/types';
import { getAuthHeader, normalizeWebDavBaseUrl } from './helpers';

export const checkWebDavConnection = async (config: WebDavConfig): Promise<boolean> => {
  try {
    const safeUrl = normalizeWebDavBaseUrl(config.url);
    const response = await fetch(safeUrl, {
      method: 'PROPFIND',
      headers: {
        Authorization: getAuthHeader(config),
        Depth: '0',
      },
    });
    return response.status < 500 && response.status !== 401;
  } catch (error) {
    console.error('WebDAV连接检查失败:', error);
    return false;
  }
};

export const ensureWebDavDirectory = async (
  baseUrl: string,
  config: WebDavConfig
): Promise<void> => {
  const normalizedBase = normalizeWebDavBaseUrl(baseUrl);
  const directoryUrl = normalizedBase.endsWith('/') ? normalizedBase : `${normalizedBase}/`;
  const headers = { Authorization: getAuthHeader(config) };

  const checkResponse = await fetch(directoryUrl, {
    method: 'PROPFIND',
    headers: { ...headers, Depth: '0' },
  });

  if (checkResponse.ok || checkResponse.status === 207 || checkResponse.status === 405) {
    return;
  }

  if (checkResponse.status === 404) {
    const createResponse = await fetch(directoryUrl, {
      method: 'MKCOL',
      headers,
    });
    if (createResponse.ok || createResponse.status === 405) {
      return;
    }
    throw new Error(`创建目录失败: ${createResponse.status}`);
  }

  if (checkResponse.status === 401) {
    throw new Error('认证失败，请检查用户名与密码');
  }

  throw new Error(`目录不可访问: ${checkResponse.status}`);
};
