import {
  GITHUB_OWNER,
  GITHUB_REPO,
  UPDATE_CACHE_KEY,
  UPDATE_CACHE_TTL,
  type UpdateInfo,
} from './types';
import { compareVersions, extractLatestVersion, extractReleaseNotes } from './version';

interface CachedUpdatePayload {
  data: UpdateInfo;
  timestamp: number;
}

const readUpdateCache = (currentVersion: string): UpdateInfo | null => {
  try {
    const cached = localStorage.getItem(UPDATE_CACHE_KEY);
    if (!cached) return null;

    const payload = JSON.parse(cached) as CachedUpdatePayload;
    if (Date.now() - payload.timestamp > UPDATE_CACHE_TTL) {
      return null;
    }

    return {
      ...payload.data,
      hasUpdate: compareVersions(payload.data.latestVersion, currentVersion) > 0,
    };
  } catch {
    return null;
  }
};

const writeUpdateCache = (data: UpdateInfo) => {
  try {
    localStorage.setItem(
      UPDATE_CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      } satisfies CachedUpdatePayload)
    );
  } catch (error) {
    console.warn('Failed to cache update info:', error);
  }
};

const parseUpdateInfo = (html: string, currentVersion: string): UpdateInfo => {
  const latestVersion = extractLatestVersion(html);
  return {
    hasUpdate: compareVersions(latestVersion, currentVersion) > 0,
    latestVersion,
    releaseUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/v${latestVersion}`,
    releaseNotes: extractReleaseNotes(html) || undefined,
  };
};

const fetchReleasePage = async (): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
      {
        headers: {
          Accept: 'text/html',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`请求失败 (${response.status})`);
    }

    return response.text();
  } finally {
    clearTimeout(timeoutId);
  }
};

export const checkUpdate = async (
  currentVersion: string,
  forceRefresh = false
): Promise<UpdateInfo> => {
  if (!forceRefresh) {
    const cached = readUpdateCache(currentVersion);
    if (cached) return cached;
  }

  try {
    const info = parseUpdateInfo(await fetchReleasePage(), currentVersion);
    writeUpdateCache(info);
    return info;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return {
        hasUpdate: false,
        latestVersion: '',
        releaseUrl: '',
        error: '请求超时，请检查网络连接',
      };
    }

    return {
      hasUpdate: false,
      latestVersion: '',
      releaseUrl: '',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
};
