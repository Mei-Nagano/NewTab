import { DEFAULT_SETTINGS } from '@/constants';
import type { AppSettings } from '@/types';

export const createSettingsFixture = (overrides?: Partial<AppSettings>): AppSettings => {
  return {
    ...DEFAULT_SETTINGS,
    ...overrides,
    groups: overrides?.groups || DEFAULT_SETTINGS.groups.map((group) => ({ ...group, links: [...group.links] })),
  };
};
