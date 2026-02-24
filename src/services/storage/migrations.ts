import { DEFAULT_SETTINGS } from '@/constants';
import type { AppSettings } from '@/types';

export const VIRTUAL_ALL_GROUP_ID = '__all__';

const migrateLegacyLinksField = (settings: AppSettings): AppSettings => {
  const legacy = settings as AppSettings & { links?: AppSettings['groups'][number]['links'] };
  if (legacy.links && (!settings.groups || settings.groups.length === 0)) {
    return {
      ...settings,
      groups: [
        {
          id: 'g-migrated',
          title: '常用',
          links: legacy.links,
        },
      ],
    };
  }

  return settings;
};

const removeVirtualGroups = (settings: AppSettings): AppSettings => {
  if (!Array.isArray(settings.groups)) {
    return settings;
  }

  return {
    ...settings,
    groups: settings.groups.filter((group) => group.id !== VIRTUAL_ALL_GROUP_ID),
  };
};

const ensureNonEmptyGroups = (settings: AppSettings): AppSettings => {
  if (settings.groups && settings.groups.length > 0) {
    return settings;
  }

  return {
    ...settings,
    groups: DEFAULT_SETTINGS.groups,
  };
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const ensureVisualSettings = (settings: AppSettings): AppSettings => {
  const defaultBlurAmount = DEFAULT_SETTINGS.bgBlurAmount ?? 8;
  const defaultDarkMaskOpacity = DEFAULT_SETTINGS.darkMaskOpacity ?? 40;
  const rawBlurAmount =
    typeof settings.bgBlurAmount === 'number' && Number.isFinite(settings.bgBlurAmount)
      ? settings.bgBlurAmount
      : defaultBlurAmount;
  const rawDarkMaskOpacity =
    typeof settings.darkMaskOpacity === 'number' && Number.isFinite(settings.darkMaskOpacity)
      ? settings.darkMaskOpacity
      : defaultDarkMaskOpacity;

  return {
    ...settings,
    bgBlurAmount: clamp(rawBlurAmount, 0, 24),
    darkMaskOpacity: clamp(rawDarkMaskOpacity, 0, 100),
  };
};

export const normalizeSettings = (settings: AppSettings): AppSettings => {
  return ensureVisualSettings(ensureNonEmptyGroups(removeVirtualGroups(migrateLegacyLinksField(settings))));
};
