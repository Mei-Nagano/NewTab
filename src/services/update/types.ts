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
const ONE_SECOND_MS = 1000;
const ONE_MINUTE_SECONDS = 60;
const UPDATE_CACHE_TTL_MINUTES = 5;

export const UPDATE_CACHE_TTL = UPDATE_CACHE_TTL_MINUTES * ONE_MINUTE_SECONDS * ONE_SECOND_MS;
