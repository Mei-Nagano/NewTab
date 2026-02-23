import type { AppSettings, WebDavConfig } from '@/types';
import { getAuthHeader, normalizeBackupUrl } from './helpers';

export const restoreFromWebDav = async (
  config: WebDavConfig
): Promise<Partial<AppSettings>> => {
  if (!config.url) {
    throw new Error('WebDAV URL 未设置');
  }

  const response = await fetch(normalizeBackupUrl(config.url), {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(config),
      'Cache-Control': 'no-cache',
    },
  });

  if (response.ok) {
    return response.json() as Promise<Partial<AppSettings>>;
  }

  if (response.status === 404) {
    throw new Error('服务器上未找到备份文件');
  }
  if (response.status === 401) {
    throw new Error('认证失败 (401)');
  }
  throw new Error(`恢复失败: ${response.status}`);
};
