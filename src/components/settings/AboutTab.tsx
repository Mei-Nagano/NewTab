import React, { useState } from 'react';
import { checkUpdate, type UpdateInfo, GITHUB_OWNER, GITHUB_REPO } from '../../utils/update';
import { APP_VERSION } from '../../constants';

interface AboutTabProps {
    theme: 'light' | 'dark';
    onUpdateStatusChange?: (status: 'checking' | 'latest' | 'outdated' | 'error') => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ theme, onUpdateStatusChange }) => {
    const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const currentVersion = APP_VERSION;

    React.useEffect(() => {
        // Auto check once when the component mounts (use cache)
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
        <div className="space-y-6">
            <div className={`p-6 rounded-2xl border transition-colors ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/5 border-white/5'
                }`}>
                <div className="flex items-center gap-4 mb-4">
                    <img src="/icons/icon128.png" alt="Logo" className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/10" />
                    <div>
                        <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>NewTab</h1>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                            一个极简、美观、高效的浏览器新标签页。
                        </p>
                    </div>
                </div>

                <div className={`mt-6 pt-6 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                当前版本: v{currentVersion}
                            </div>
                            <div className={`text-xs mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
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
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                                : 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
                                }`}
                        >
                            {checkStatus === 'checking' ? 'Checking...' : '检查更新'}
                        </button>
                    </div>

                    {updateInfo?.hasUpdate && (
                        <div className={`mt-4 p-4 rounded-lg border ${theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-blue-500/10 border-blue-500/20'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={theme === 'light' ? 'text-blue-700' : 'text-blue-300'}>
                                    新版本 <b>v{updateInfo.latestVersion}</b> 可用
                                </span>
                                <a
                                    href={updateInfo.releaseUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${theme === 'light'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    去下载
                                </a>
                            </div>

                            {updateInfo.releaseNotes && (
                                <div className={`mt-3 pt-3 border-t ${theme === 'light' ? 'border-blue-200' : 'border-blue-500/20'
                                    }`}>
                                    <div className={`text-xs font-medium mb-2 ${theme === 'light' ? 'text-blue-900' : 'text-blue-200'
                                        }`}>
                                        更新内容：
                                    </div>
                                    <div className={`text-sm whitespace-pre-wrap max-h-48 overflow-y-auto rounded p-2 ${theme === 'light'
                                        ? 'bg-white/50 text-blue-800'
                                        : 'bg-black/20 text-blue-100'
                                        }`} style={{
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: theme === 'light' ? '#93c5fd #dbeafe' : '#3b82f6 #1e3a8a'
                                        }}>
                                        {updateInfo.releaseNotes}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-colors ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/5 border-white/5'
                }`}>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>关于项目</h3>
                <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                    这是一个开源的浏览器新标签页扩展，旨在提供简洁、美观且高效的起始页体验。
                    源代码托管在 GitHub 上。
                </p>
                <div className="mt-4">
                    <a
                        href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-sm ${theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        访问 GitHub 仓库
                    </a>
                </div>
            </div>
        </div>
    );
};


