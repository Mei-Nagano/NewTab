import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildLegacyFaviconKey,
  clearCachedFavicons,
  loadCachedFavicon,
  saveCachedFavicon,
} from '@/services/storage/faviconCacheStore';

describe('faviconCacheStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores a fetched favicon by hostname so the next read can reuse it', async () => {
    const iconDataUrl = 'data:image/png;base64,abc123';

    await saveCachedFavicon('https://example.com/docs/page', iconDataUrl);

    await expect(loadCachedFavicon('https://example.com/another')).resolves.toBe(iconDataUrl);
  });

  it('ignores non-image cached values', async () => {
    localStorage.setItem('newtab_favicon_cache:example.com', 'https://example.com/favicon.ico');

    await expect(loadCachedFavicon('https://example.com')).resolves.toBe('');
  });

  it('clears both current and legacy favicon cache entries', async () => {
    localStorage.setItem('newtab_favicon_cache:example.com', 'data:image/png;base64,abc123');
    localStorage.setItem(buildLegacyFaviconKey('link-1'), 'https://example.com/favicon.ico');
    localStorage.setItem('newtab_settings', '{}');

    await expect(clearCachedFavicons()).resolves.toBe(2);
    expect(localStorage.getItem('newtab_favicon_cache:example.com')).toBeNull();
    expect(localStorage.getItem(buildLegacyFaviconKey('link-1'))).toBeNull();
    expect(localStorage.getItem('newtab_settings')).toBe('{}');
  });
});
