import type { AppSettings } from '@/types';
import { ensureWebDavDirectory } from './connection';
import { getAuthHeader, normalizeBackupUrl } from './helpers';

const sanitizeBackupPayload = (settings: AppSettings): Omit<AppSettings, 'webdav'> => {
  const { webdav: _webdav, ...rest } = settings;
  return rest;
};

export const backupToWebDav = async (settings: AppSettings): Promise<void> => {
  if (!settings.webdav.url) {
    throw new Error('WebDAV URL 未设置');
  }

  await ensureWebDavDirectory(settings.webdav.url, settings.webdav);

  const response = await fetch(normalizeBackupUrl(settings.webdav.url), {
    method: 'PUT',
    headers: {
      Authorization: getAuthHeader(settings.webdav),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sanitizeBackupPayload(settings), null, 2),
  });

  if (response.ok) return;
  if (response.status === 401) throw new Error('认证失败 (401)');
  if (response.status === 404) throw new Error('路径未找到 (404)');
  if (response.status === 409) throw new Error('目录冲突 (409)');
  throw new Error(`备份失败: ${response.status}`);
};
