import type { WebDavConfig } from '@/types';

const FILENAME = 'newtab-backup.json';
const LOCAL_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export const getAuthHeader = (config: WebDavConfig): string => {
  const safeStr = unescape(encodeURIComponent(`${config.username}:${config.password}`));
  return `Basic ${btoa(safeStr)}`;
};

export const normalizeBackupUrl = (url: string): string => {
  const normalized = url.trim().endsWith('/') ? url.trim() : `${url.trim()}/`;
  return `${normalized}${FILENAME}`;
};

export const normalizeWebDavBaseUrl = (url: string): string => {
  const parsed = new URL(url.trim());
  const isHttps = parsed.protocol === 'https:';
  const isLocalHttp = parsed.protocol === 'http:' && LOCAL_HTTP_HOSTS.has(parsed.hostname);
  if (!isHttps && !isLocalHttp) {
    throw new Error('WebDAV URL 仅支持 HTTPS，或 localhost/127.0.0.1 的 HTTP。');
  }
  return parsed.toString();
};
