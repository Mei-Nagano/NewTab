import type { LinkGroup } from '@/types';

const URL_PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

const normalizePathname = (pathname: string): string => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

export const normalizeLinkUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || URL_PROTOCOL_PATTERN.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const toLinkDedupKey = (url: string): string => {
  const normalizedUrl = normalizeLinkUrl(url);
  if (!normalizedUrl) return '';
  if (normalizedUrl.startsWith('data:')) {
    return normalizedUrl;
  }

  try {
    const parsed = new URL(normalizedUrl);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const isDefaultPort =
      (protocol === 'https:' && parsed.port === '443') ||
      (protocol === 'http:' && parsed.port === '80');
    const port = parsed.port && !isDefaultPort ? `:${parsed.port}` : '';
    const pathname = normalizePathname(parsed.pathname);

    return `${protocol}//${hostname}${port}${pathname}${parsed.search}`;
  } catch {
    return normalizedUrl.toLowerCase();
  }
};

export const buildLinkDedupKeySet = (
  groups: LinkGroup[],
  ignoreLinkId?: string
): Set<string> => {
  const keys = new Set<string>();
  groups.forEach((group) => {
    group.links.forEach((link) => {
      if (ignoreLinkId && link.id === ignoreLinkId) return;
      const key = toLinkDedupKey(link.url);
      if (key) keys.add(key);
    });
  });
  return keys;
};
