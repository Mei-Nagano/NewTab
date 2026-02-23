declare const chrome: any;

export const isExtensionEnvironment = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
};

export const readFromStorage = async <T>(key: string): Promise<T | undefined> => {
  if (isExtensionEnvironment()) {
    const result = await new Promise<Record<string, T>>((resolve) => {
      chrome.storage.local.get([key], resolve);
    });
    return result[key];
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
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

export const writeRawToStorage = async (key: string, value: string): Promise<void> => {
  if (isExtensionEnvironment()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
    return;
  }

  localStorage.setItem(key, value);
};

export const readRawFromStorage = async (key: string): Promise<string> => {
  if (isExtensionEnvironment()) {
    const result = await new Promise<Record<string, string>>((resolve) => {
      chrome.storage.local.get([key], resolve);
    });
    return result[key] || '';
  }

  return localStorage.getItem(key) || '';
};
