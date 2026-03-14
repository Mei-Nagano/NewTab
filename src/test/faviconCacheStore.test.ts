import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildLegacyFaviconKey,
  clearCachedFavicons,
  loadCachedFavicon,
  loadLegacyCachedFaviconSource,
  saveCachedFavicon,
} from '@/services/storage/faviconCacheStore';

describe('faviconCacheStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it('reads legacy favicon cache through the storage bridge', async () => {
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: (keys: string[], callback: (items: Record<string, unknown>) => void) => {
            callback({ [keys[0]]: 'data:image/png;base64,legacy123' });
          },
          set: () => undefined,
          remove: () => undefined,
        },
      },
    });

    await expect(loadLegacyCachedFaviconSource('link-1')).resolves.toBe('data:image/png;base64,legacy123');
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
