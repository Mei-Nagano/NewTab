import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/constants';
import { normalizeSettings } from '@/services/storage';
import type { AppSettings, Link } from '@/types';

describe('storage migrations', () => {
  it('removes virtual __all__ group from settings', () => {
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      groups: [
        ...DEFAULT_SETTINGS.groups,
        { id: '__all__', title: '所有链接', links: [] },
      ],
    };
    const result = normalizeSettings(settings);
    expect(result.groups.some((group) => group.id === '__all__')).toBe(false);
  });

  it('migrates legacy links to groups', () => {
    const legacyLinks: Link[] = [{ id: '1', title: 'A', url: 'https://a.com' }];
    const legacySettings = {
      ...DEFAULT_SETTINGS,
      groups: [],
      links: legacyLinks,
    } as AppSettings & { links: Link[] };

    const result = normalizeSettings(legacySettings as AppSettings);
    expect(result.groups.length).toBe(1);
    expect(result.groups[0].links[0].id).toBe('1');
  });

  it('normalizes visual intensity settings', () => {
    const invalidSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      bgBlurAmount: -5,
      darkMaskOpacity: 140,
    };

    const invalidResult = normalizeSettings(invalidSettings);
    expect(invalidResult.bgBlurAmount).toBe(0);
    expect(invalidResult.darkMaskOpacity).toBe(100);

    const missingSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      bgBlurAmount: undefined,
      darkMaskOpacity: undefined,
    };
    const missingResult = normalizeSettings(missingSettings);
    expect(missingResult.bgBlurAmount).toBe(DEFAULT_SETTINGS.bgBlurAmount);
    expect(missingResult.darkMaskOpacity).toBe(DEFAULT_SETTINGS.darkMaskOpacity);
  });
});
