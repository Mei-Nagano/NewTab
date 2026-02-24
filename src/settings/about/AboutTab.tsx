import React, { useState } from 'react';
import { APP_VERSION } from '@/constants';
import { checkUpdate, type UpdateInfo, GITHUB_OWNER, GITHUB_REPO } from '@/services/update';
import { SettingSection } from '../components/SettingSection';

interface AboutTabProps {
    theme: 'light' | 'dark';
    onUpdateStatusChange?: (status: 'checking' | 'latest' | 'outdated' | 'error') => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ theme, onUpdateStatusChange }) => {
    const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const currentVersion = APP_VERSION;
    const isLight = theme === 'light';

    React.useEffect(() => {
        handleCheckUpdate(false);
    }, []);

    const handleCheckUpdate = async (forceRefresh: boolean = true) => {
        setCheckStatus('checking');
        if (onUpdateStatusChange) onUpdateStatusChange('checking');

        try {
            const info = await checkUpdate(currentVersion, forceRefresh);
            setUpdateInfo(info);
            setCheckStatus('success');

            if (onUpdateStatusChange) {
                if (info.error) onUpdateStatusChange('error');
                else onUpdateStatusChange(info.hasUpdate ? 'outdated' : 'latest');
            }
        } catch {
            setCheckStatus('error');
            if (onUpdateStatusChange) onUpdateStatusChange('error');
        }
    };

    return (
        <div className="space-y-8 pb-4">
            <SettingSection title="版本信息" theme={theme} accentColor="bg-blue-500">
                <div className="flex items-center gap-6 mb-6">
                    <img src="/icons/icon128.png" alt="Logo" className="w-20 h-20 rounded-2xl shadow-xl border-2 border-white/10 transition-transform hover:scale-105 duration-300" />
                    <div className="space-y-1">
                        <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>NewTab</h1>
                        <p className={`text-xs font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            极简、美观、高效的起始页
                        </p>
                    </div>
                </div>

                <div className={`mt-6 pt-6 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                当前版本: v{currentVersion}
                            </div>
                            <div className={`text-[11px] font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                {checkStatus === 'idle' && '点击检查更新以获取最新版本'}
                                {checkStatus === 'checking' && '正在检查更新...'}
                                {checkStatus === 'success' && updateInfo?.hasUpdate && `发现新版本: v${updateInfo.latestVersion}`}
                                {checkStatus === 'success' && !updateInfo?.hasUpdate && !updateInfo?.error && '当前已是最新版本'}
                                {checkStatus === 'success' && updateInfo?.error && `检查失败: ${updateInfo.error}`}
                                {checkStatus === 'error' && '检查更新时发生未知错误'}
                            </div>
                        </div>

                        <button
                            onClick={() => handleCheckUpdate(true)}
                            disabled={checkStatus === 'checking'}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${isLight
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 disabled:opacity-50'
                                : 'bg-white/10 text-white hover:bg-white/20 active:scale-95 disabled:opacity-50'
                                }`}
                        >
                            {checkStatus === 'checking' ? 'Checking...' : '检查更新'}
                        </button>
                    </div>

                    {updateInfo?.hasUpdate && (
                        <div className={`mt-6 p-5 rounded-2xl border animate-fade-in ${isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-blue-500/10 border-blue-500/20'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-sm font-bold ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                                    新版本 <b className="text-base">v{updateInfo.latestVersion}</b> 可用
                                </span>
                                <a
                                    href={updateInfo.releaseUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    立即更新
                                </a>
                            </div>

                            {updateInfo.releaseNotes && (
                                <div className={`pt-4 border-t ${isLight ? 'border-blue-200' : 'border-blue-500/10'}`}>
                                    <div className={`text-[11px] font-black uppercase tracking-widest mb-2 ${isLight ? 'text-blue-900/60' : 'text-blue-200/50'}`}>
                                        更新内容
                                    </div>
                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto rounded-xl p-3 ${isLight ? 'bg-white/50 text-blue-800' : 'bg-black/20 text-blue-100'}`} style={{ scrollbarWidth: 'thin' }}>
                                        {updateInfo.releaseNotes}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SettingSection>

            <SettingSection title="项目贡献" theme={theme} accentColor="bg-purple-500">
                <p className={`text-sm leading-relaxed font-medium ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    这是一个开源项目，旨在提供简洁、美观且高效的起始页体验。如果觉得不错，可以到 GitHub 点个 Star。
                </p>
                <div className="pt-2">
                    <a
                        href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${isLight
                            ? 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        访问 GitHub 仓库
                    </a>
                </div>
            </SettingSection>
        </div>
    );
};
