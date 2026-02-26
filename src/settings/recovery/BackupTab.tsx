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

export const BackupTab = ({
  settings,
  setSettings,
  status,
  onBackup,
  onRestore,
  onExport,
  onImport,
  theme,
}: BackupTabProps) => {
  const isLight = theme === 'light';
  const isError = status.type === 'error';

  return (
    <div className="space-y-8 animate-fade-in">
      <SettingSection
        title={'WebDAV \u4e91\u540c\u6b65'}
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
          <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {'\u670d\u52a1\u5668\u5730\u5740'}
          </label>
          <input
            type="text"
            placeholder={
              'https://dav.example.com/path\uff08\u53ef\u542b\u76ee\u5f55\uff09'
            }
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
            <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {'\u7528\u6237\u540d'}
            </label>
            <input
              type="text"
              placeholder={'\u8f93\u5165\u7528\u6237\u540d'}
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
            <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {'\u5bc6\u7801'}
            </label>
            <input
              type="password"
              placeholder={'\u8f93\u5165\u5bc6\u7801'}
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
            {'\u5907\u4efd\u5230\u4e91\u7aef'}
          </button>
          <button
            onClick={onRestore}
            className={`px-5 py-3 rounded-xl text-sm font-semibold border transition-colors ${
              isLight
                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {'\u4ece\u4e91\u7aef\u6062\u590d'}
          </button>
        </div>
      </SettingSection>

      <SettingSection
        title={'\u672c\u5730\u5907\u4efd'}
        theme={theme}
        accentColor="bg-emerald-500"
        description={
          '\u53ef\u5c06\u5f53\u524d\u8bbe\u7f6e\u5bfc\u51fa\u4e3a\u672c\u5730 JSON \u6587\u4ef6\uff0c\u4e5f\u53ef\u5bfc\u5165\u5386\u53f2\u5907\u4efd\u6587\u4ef6\u3002'
        }
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
            <div className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {'\u5bfc\u51fa\u8bbe\u7f6e'}
            </div>
            <div className="text-xs mt-2 text-gray-500">
              {'\u5c06\u5f53\u524d\u914d\u7f6e\u4fdd\u5b58\u4e3a JSON \u6587\u4ef6\u3002'}
            </div>
          </button>
          <button
            onClick={onImport}
            className={`p-5 rounded-2xl border text-left transition-all ${
              isLight
                ? 'bg-white border-gray-200 hover:border-blue-300'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {'\u5bfc\u5165\u8bbe\u7f6e'}
            </div>
            <div className="text-xs mt-2 text-gray-500">
              {'\u4ece\u672c\u5730 JSON \u6587\u4ef6\u6062\u590d\u914d\u7f6e\u3002'}
            </div>
          </button>
        </div>
      </SettingSection>
    </div>
  );
};
