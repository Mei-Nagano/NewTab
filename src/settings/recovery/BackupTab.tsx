import type { Dispatch, SetStateAction } from 'react';
import { SettingSection } from '@/settings/components/SettingSection';
import type { AppSettings } from '@/types';

interface BackupTabProps {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  status: { type: string; message: string };
  onBackup: () => void;
  onRestore: () => void;
  onExport: () => void;
  onImport: () => void;
  theme: 'light' | 'dark';
}

export const BackupTab = ({ settings, setSettings, status, onBackup, onRestore, onExport, onImport, theme }: BackupTabProps) => {
  const isLight = theme === 'light';
  const isError = status.type === 'error';

  return (
    <div className="space-y-8 animate-fade-in">
      <SettingSection
        title="WebDAV Cloud Sync"
        theme={theme}
        accentColor="bg-blue-500"
        headerAction={status.message ? (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isError
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}
          >
            {status.message}
          </div>
        ) : null}
      >
        <div className="space-y-2">
          <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Server URL</label>
          <input
            type="text"
            placeholder="https://dav.example.com/path"
            value={settings.webdav.url}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                webdav: { ...previous.webdav, url: event.target.value },
              }))
            }
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              isLight
                ? 'bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-gray-900'
                : 'bg-black/20 border-white/10 focus:border-blue-500/60 text-white'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={settings.webdav.username}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  webdav: { ...previous.webdav, username: event.target.value },
                }))
              }
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                isLight
                  ? 'bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-gray-900'
                  : 'bg-black/20 border-white/10 focus:border-blue-500/60 text-white'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={settings.webdav.password}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  webdav: { ...previous.webdav, password: event.target.value },
                }))
              }
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                isLight
                  ? 'bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-gray-900'
                  : 'bg-black/20 border-white/10 focus:border-blue-500/60 text-white'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onBackup}
            className="px-5 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Backup to Cloud
          </button>
          <button
            onClick={onRestore}
            className={`px-5 py-3 rounded-xl text-sm font-semibold border transition-colors ${
              isLight
                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            Restore from Cloud
          </button>
        </div>
      </SettingSection>

      <SettingSection
        title="Local Backup"
        theme={theme}
        accentColor="bg-emerald-500"
        description="Export all settings to a local JSON file, or import a previous backup."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onExport}
            className={`p-5 rounded-2xl border text-left transition-all ${
              isLight
                ? 'bg-white border-gray-200 hover:border-emerald-300'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Export Settings</div>
            <div className="text-xs mt-2 text-gray-500">Save current settings as JSON.</div>
          </button>
          <button
            onClick={onImport}
            className={`p-5 rounded-2xl border text-left transition-all ${
              isLight
                ? 'bg-white border-gray-200 hover:border-blue-300'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Import Settings</div>
            <div className="text-xs mt-2 text-gray-500">Load settings from a local JSON file.</div>
          </button>
        </div>
      </SettingSection>
    </div>
  );
};
