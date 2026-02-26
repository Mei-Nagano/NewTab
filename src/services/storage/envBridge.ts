interface ChromeStorageArea {
  get: (keys: string[], callback: (items: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
}

interface ChromeRuntime {
  storage?: {
    local?: ChromeStorageArea;
  };
}

declare const chrome: ChromeRuntime;

export const isExtensionEnvironment = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
};

export const readFromStorage = async <T>(key: string): Promise<T | undefined> => {
  if (isExtensionEnvironment()) {
    const result = await new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage?.local?.get([key], resolve);
    });
    return result[key] as T | undefined;
  }

  const raw = localStorage.getItem(key);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
};

export const writeToStorage = async <T>(key: string, value: T): Promise<void> => {
  if (isExtensionEnvironment()) {
    await new Promise<void>((resolve) => {
      chrome.storage?.local?.set({ [key]: value }, () => resolve());
    });
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

export const writeRawToStorage = async (key: string, value: string): Promise<void> => {
  if (isExtensionEnvironment()) {
    await new Promise<void>((resolve) => {
      chrome.storage?.local?.set({ [key]: value }, () => resolve());
    });
    return;
  }

  localStorage.setItem(key, value);
};

export const readRawFromStorage = async (key: string): Promise<string> => {
  if (isExtensionEnvironment()) {
    const result = await new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage?.local?.get([key], resolve);
    });
    const value = result[key];
    return typeof value === 'string' ? value : '';
  }

  return localStorage.getItem(key) || '';
};
