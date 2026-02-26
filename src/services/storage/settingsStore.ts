import { DEFAULT_SETTINGS } from '@/constants';
import type { AppSettings } from '@/types';
import {
  isExtensionEnvironment,
  readFromStorage,
  readRawFromStorage,
  writeToStorage,
  writeRawToStorage,
} from './envBridge';
import { normalizeSettings } from './migrations';

const SETTINGS_KEY = 'newtab_settings';
const LOCAL_IMAGE_FLAG = '[LOCAL_IMAGE]';
const IMAGE_STORAGE_KEY = 'newtab_custom_bg_data';

const readSettingsPayload = async (): Promise<Partial<AppSettings> | undefined> => {
  if (isExtensionEnvironment()) {
    return await readFromStorage<Partial<AppSettings>>('settings');
  }

  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as Partial<AppSettings>;
  } catch {
    return undefined;
  }
};

const restoreEmbeddedImage = async (settings: AppSettings): Promise<AppSettings> => {
  if (settings.customBgUrl !== LOCAL_IMAGE_FLAG) {
    return settings;
  }

  const imageData = await readRawFromStorage(IMAGE_STORAGE_KEY);
  return {
    ...settings,
    customBgUrl: imageData,
  };
};

export const loadSettings = async (): Promise<AppSettings> => {
  const payload = await readSettingsPayload();
  const merged = {
    ...DEFAULT_SETTINGS,
    ...(payload || {}),
  };
  return restoreEmbeddedImage(normalizeSettings(merged));
};

const persistSettingsPayload = async (settings: AppSettings): Promise<void> => {
  if (isExtensionEnvironment()) {
    await writeToStorage('settings', settings);
    return;
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  const normalized = normalizeSettings(settings);
  const payload = { ...normalized };
  const imageData = payload.customBgUrl.startsWith('data:') ? payload.customBgUrl : '';

  if (imageData) {
    payload.customBgUrl = LOCAL_IMAGE_FLAG;
    await writeRawToStorage(IMAGE_STORAGE_KEY, imageData);
  } else if (payload.customBgUrl !== LOCAL_IMAGE_FLAG && !isExtensionEnvironment()) {
    localStorage.removeItem(IMAGE_STORAGE_KEY);
  }

  await persistSettingsPayload(payload);
};

export const STORAGE_KEYS = {
  SETTINGS_KEY,
  LOCAL_IMAGE_FLAG,
  IMAGE_STORAGE_KEY,
};
