import React, { useState, useEffect } from 'react';
import type { AppSettings, Link } from '../constants';
import { APP_VERSION } from '../constants';
import { getBrowserBookmarks, exportSettingsToFile, importSettingsFromFile } from '../utils/storage';
import { backupToWebDav, restoreFromWebDav } from '../utils/webdav';
import { GeneralTab } from './settings/GeneralTab';
import { LinksTab } from './settings/LinksTab';
import { BackupTab } from './settings/BackupTab';
import { BookmarkImportView } from './settings/BookmarkImportView';
import { AboutTab } from './settings/AboutTab';
import { AlertDialog } from './AlertDialog';

declare var chrome: any;

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
    theme: 'light' | 'dark';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, theme }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'links' | 'backup' | 'about'>('general');
    const [tempSettings, setTempSettings] = useState<AppSettings>(settings);

    // Group State (Lifted from LinksTab to support Import)
    const [activeGroupId, setActiveGroupId] = useState<string>('');

    // Import State
    const [isImportMode, setIsImportMode] = useState(false);
    const [isFetchingBookmarks, setIsFetchingBookmarks] = useState(false);
    const [bookmarkCandidates, setBookmarkCandidates] = useState<Link[]>([]);
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    // WebDAV / Backup State
    const [backupStatus, setBackupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    // Cache State
    const [cacheClearStatus, setCacheClearStatus] = useState('');

    // Update Status
    const [updateStatus, setUpdateStatus] = useState<'checking' | 'latest' | 'outdated' | 'error' | 'idle'>('idle');

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string }>({
        isOpen: false,
        title: '',
        message: ''
    });

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempSettings(settings); // Reset temp settings
            // Initialize active group
            const groups = settings.groups;
            if (groups && groups.length > 0) {
                // If current active group is invalid, reset to first group
                if (!groups.find(g => g.id === activeGroupId)) {
                    setActiveGroupId(groups[0].id);
                }
            } else {
                setActiveGroupId('');
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(tempSettings);
        onClose();
    };

    // Import Logic
    const startImport = async () => {
        // Check environment
        const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
        if (!isExtension) {
            setAlertConfig({
                isOpen: true,
                title: '提示',
                message: '受浏览器安全限制，非浏览器扩展环境无法直接获取书签。如要使用该功能请将本项目作为浏览器扩展安装。'
            });
            return;
        }

        setIsFetchingBookmarks(true);
        try {
            const bookmarks = await getBrowserBookmarks();
            if (bookmarks.length === 0) {
                setAlertConfig({
                    isOpen: true,
                    title: '提示',
                    message: '未找到书签或浏览器书签 API 不可用。'
                });
                return;
            }
            setBookmarkCandidates(bookmarks);
            setIsImportMode(true);
            setSelectedCandidateIds(new Set());
            setSearchTerm('');
        } catch (e) {
            console.error(e);
            setAlertConfig({
                isOpen: true,
                title: '错误',
                message: '获取书签失败，请确认已授予书签访问权限。'
            });
        } finally {
            setIsFetchingBookmarks(false);
        }
    };

    const confirmImport = () => {
        const toImport = bookmarkCandidates.filter(b => selectedCandidateIds.has(b.id));
        const newLinks = toImport.map(b => ({
            ...b,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        setTempSettings(prev => ({
            ...prev,
            groups: prev.groups.map(g =>
                g.id === activeGroupId
                    ? { ...g, links: [...g.links, ...newLinks] }
                    : g
            )
        }));
        setIsImportMode(false);
        setBookmarkCandidates([]);
    };

    const toggleCandidate = (id: string) => {
        const newSet = new Set(selectedCandidateIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCandidateIds(newSet);
    };

    const toggleSelectAllImport = () => {
        const filtered = bookmarkCandidates.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.url.toLowerCase().includes(searchTerm.toLowerCase()));
        if (selectedCandidateIds.size === filtered.length && filtered.length > 0) {
            setSelectedCandidateIds(new Set());
        } else {
            const newSet = new Set(selectedCandidateIds);
            filtered.forEach(b => newSet.add(b.id));
            setSelectedCandidateIds(newSet);
        }
    };

    const filteredCandidates = bookmarkCandidates.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // WebDAV Logic
    const handleBackup = async () => {
        setBackupStatus('loading');
        setStatusMessage('正在上传设置...');
        try {
            await backupToWebDav(tempSettings);
            setBackupStatus('success');
            setStatusMessage('备份成功完成！');
        } catch (e: any) {
            setBackupStatus('error');
            setStatusMessage(e.message || '备份失败');
        }
    };

    const handleRestore = async () => {
        setBackupStatus('loading');
        setStatusMessage('正在下载设置...');
        try {
            const restoredData = await restoreFromWebDav(tempSettings.webdav);
            setTempSettings(prev => ({
                ...prev,
                ...restoredData,
                webdav: prev.webdav // Keep current connection details
            }));
            setBackupStatus('success');
            setStatusMessage('设置已恢复！点击"保存更改"以应用。');
        } catch (e: any) {
            setBackupStatus('error');
            setStatusMessage(e.message || '恢复失败');
        }
    };

    // Local Backup Logic
    const handleLocalExport = () => {
        try {
            exportSettingsToFile(tempSettings);
            setBackupStatus('success');
            setStatusMessage('本地备份导出成功！');
            setTimeout(() => {
                setBackupStatus('idle');
                setStatusMessage('');
            }, 3000);
        } catch (e: any) {
            setBackupStatus('error');
            setStatusMessage(e.message || '导出失败');
        }
    };

    const handleLocalImport = async () => {
        try {
            setBackupStatus('loading');
            setStatusMessage('正在读取备份文件...');
            const importedSettings = await importSettingsFromFile();
            setTempSettings(prev => ({
                ...prev,
                ...importedSettings,
                webdav: prev.webdav
            }));
            setBackupStatus('success');
            setStatusMessage('本地备份导入成功！点击"保存更改"以应用。');
        } catch (e: any) {
            setBackupStatus('error');
            setStatusMessage(e.message || '导入失败');
        }
    };

    // Cache Clear Logic
    const handleClearCache = () => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('newtab_fav_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));

        setCacheClearStatus(`已清除 ${keysToRemove.length} 个缓存图标`);
        setTimeout(() => setCacheClearStatus(''), 2500);
    };

    const activeGroupTitle = tempSettings.groups.find(g => g.id === activeGroupId)?.title || '未选择分组';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className={`relative w-full max-w-4xl h-[85vh] border rounded-2xl shadow-2xl overflow-hidden flex animate-slide-up transition-colors duration-300 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1b1e] border-white/5'
                }`}>

                {/* Sidebar */}
                <div className={`w-48 border-r flex flex-col flex-shrink-0 transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50/80 border-gray-100' : 'bg-black/30 border-white/5'
                    }`}>
                    <div className={`px-5 py-4 border-b transition-colors ${theme === 'light' ? 'border-gray-100' : 'border-white/5'
                        }`}>
                        <h2 className={`text-base font-semibold tracking-tight ${theme === 'light' ? 'text-gray-800' : 'text-white/90'
                            }`}>设置</h2>
                    </div>

                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'general'
                                ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/15 text-blue-400')
                                : (theme === 'light' ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5')
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 5 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            <span>常规</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('links')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'links'
                                ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/15 text-blue-400')
                                : (theme === 'light' ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5')
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            <span>链接管理</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('backup')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'backup'
                                ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/15 text-blue-400')
                                : (theme === 'light' ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5')
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <span>备份与恢复</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('about')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'about'
                                ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/15 text-blue-400')
                                : (theme === 'light' ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5')
                                }`}
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

                {/* Content Area */}
                <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${theme === 'light' ? 'bg-white' : 'bg-[#25262b]/50'
                    }`}>
                    {/* Toolbar / Header within content */}
                    <div className={`h-16 flex items-center justify-between px-8 border-b flex-shrink-0 transition-colors ${theme === 'light' ? 'border-gray-100' : 'border-white/5'
                        }`}>
                        <h3 className={`text-lg font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>
                            {activeTab === 'general' ? '常规设置' : activeTab === 'links' ? '链接管理' : activeTab === 'backup' ? '备份与恢复' : '关于'}
                        </h3>
                        <button
                            onClick={onClose}
                            className={`p-2 -mr-2 rounded-lg transition-colors ${theme === 'light' ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {isImportMode ? (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <BookmarkImportView
                                groupTitle={activeGroupTitle}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                candidates={filteredCandidates}
                                selectedIds={selectedCandidateIds}
                                onToggle={toggleCandidate}
                                onSelectAll={toggleSelectAllImport}
                                onConfirm={confirmImport}
                                onCancel={() => setIsImportMode(false)}
                                theme={theme}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-8 custom-scrollbar">
                            <div className="max-w-5xl mx-auto w-full animate-fade-in">
                                {activeTab === 'general' && (
                                    <GeneralTab
                                        settings={tempSettings}
                                        onSettingsChange={setTempSettings}
                                        onClearCache={handleClearCache}
                                        cacheClearStatus={cacheClearStatus}
                                        theme={theme}
                                    />
                                )}
                                {activeTab === 'links' && (
                                    <LinksTab
                                        settings={tempSettings}
                                        onSettingsChange={setTempSettings}
                                        activeGroupId={activeGroupId}
                                        setActiveGroupId={setActiveGroupId}
                                        onStartImport={startImport}
                                        isFetchingBookmarks={isFetchingBookmarks}
                                        theme={theme}
                                    />
                                )}
                                {activeTab === 'backup' && (
                                    <BackupTab
                                        settings={tempSettings}
                                        setSettings={setTempSettings}
                                        status={{ type: backupStatus, message: statusMessage }}
                                        onBackup={handleBackup}
                                        onRestore={handleRestore}
                                        onExport={handleLocalExport}
                                        onImport={handleLocalImport}
                                        theme={theme}
                                    />
                                )}
                                {activeTab === 'about' && (
                                    <AboutTab
                                        theme={theme}
                                        onUpdateStatusChange={(status) => setUpdateStatus(status)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    {!isImportMode && (
                        <div className={`px-8 py-5 border-t flex items-center justify-end gap-3 backdrop-blur-sm flex-shrink-0 transition-colors ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-[#1a1b1e]/50 border-white/5'
                            }`}>
                            <button
                                onClick={onClose}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                            >
                                保存更改
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                theme={theme}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};