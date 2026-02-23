import type { WebDavConfig } from '@/types';

const FILENAME = 'newtab-backup.json';

export const getAuthHeader = (config: WebDavConfig): string => {
  const safeStr = unescape(encodeURIComponent(`${config.username}:${config.password}`));
  return `Basic ${btoa(safeStr)}`;
};

export const normalizeBackupUrl = (url: string): string => {
  const normalized = url.trim().endsWith('/') ? url.trim() : `${url.trim()}/`;
  return `${normalized}${FILENAME}`;
};
