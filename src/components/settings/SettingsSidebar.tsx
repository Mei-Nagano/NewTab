import React from 'react';
import { APP_VERSION } from '../../constants';

interface SettingsSidebarProps {
    activeTab: 'general' | 'links' | 'backup' | 'tools' | 'about';
    setActiveTab: (tab: 'general' | 'links' | 'backup' | 'tools' | 'about') => void;
    theme: 'light' | 'dark';
    updateStatus: 'checking' | 'latest' | 'outdated' | 'error' | 'idle';
    onTabChange: () => void; // Reset import mode when tab changes
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
    activeTab, 
    setActiveTab, 
    theme, 
    updateStatus,
    onTabChange
}) => {
    
    const handleTabClick = (tab: 'general' | 'links' | 'backup' | 'tools' | 'about') => {
        setActiveTab(tab);
        onTabChange();
    };

    const getButtonClass = (tab: string) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        activeTab === tab
            ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/15 text-blue-400')
            : (theme === 'light' ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5')
    }`;

    return (
        <div className={`w-48 border-r flex flex-col flex-shrink-0 transition-colors duration-300 ${
            theme === 'light' ? 'bg-gray-50/80 border-gray-100' : 'bg-black/30 border-white/5'
        }`}>
            <div className={`px-5 py-4 border-b transition-colors ${
                theme === 'light' ? 'border-gray-100' : 'border-white/5'
            }`}>
                <h2 className={`text-base font-semibold tracking-tight ${
                    theme === 'light' ? 'text-gray-800' : 'text-white/90'
                }`}>设置</h2>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <button
                    onClick={() => handleTabClick('general')}
                    className={getButtonClass('general')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 5 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>常规</span>
                </button>

                <button
                    onClick={() => handleTabClick('links')}
                    className={getButtonClass('links')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <span>链接管理</span>
                </button>

                <button
                    onClick={() => handleTabClick('backup')}
                    className={getButtonClass('backup')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <span>备份与恢复</span>
                </button>

                <button
                    onClick={() => handleTabClick('tools')}
                    className={getButtonClass('tools')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    <span>实用工具</span>
                </button>

                <button
                    onClick={() => handleTabClick('about')}
                    className={getButtonClass('about')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span>关于</span>
                </button>
            </nav>

            <div className="p-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-500 relative">
                v{APP_VERSION}
                {updateStatus === 'latest' && (
                    <span className="w-2 h-2 rounded-full bg-green-500 absolute top-4 right-12" title="最新版本"></span>
                )}
                {updateStatus === 'outdated' && (
                    <span className="w-2 h-2 rounded-full bg-red-500 absolute top-4 right-12" title="有新版本"></span>
                )}
            </div>
        </div>
    );
};
