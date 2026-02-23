export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  releaseUrl: string;
  releaseNotes?: string;
  error?: string;
}

export const GITHUB_OWNER = 'Mei-Nagano';
export const GITHUB_REPO = 'NewTab';

export const UPDATE_CACHE_KEY = 'newtab_update_check_cache';
export const UPDATE_CACHE_TTL = 5 * 60 * 1000;
