import { useState, useEffect } from 'react';
import type { AppSettings, Link } from '../../../constants';
import { DEFAULT_SETTINGS } from '../../../constants';
import { getBrowserBookmarks, exportSettingsToFile, importSettingsFromFile } from '../../../utils/storage';
import { backupToWebDav, restoreFromWebDav } from '../../../utils/webdav';

declare const chrome: any;
const ALL_GROUP_ID = '__all__';

interface UseSettingsModalProps {
    isOpen: boolean;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
    onClose: () => void;
}

export const useSettingsModal = ({ isOpen, settings, onSave, onClose }: UseSettingsModalProps) => {
    const [activeTab, setActiveTab] = useState<'general' | 'links' | 'backup' | 'tools' | 'about'>('general');
    const [tempSettings, setTempSettings] = useState<AppSettings>(settings);

    // Group State
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

    // Reset Confirm Dialog State
    const [resetConfirmDialog, setResetConfirmDialog] = useState<{ isOpen: boolean }>({
        isOpen: false
    });

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempSettings(settings);
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

    // Reset Settings Logic
    const handleResetSettings = () => {
        setResetConfirmDialog({ isOpen: true });
    };

    const confirmResetSettings = () => {
        const currentGroups = tempSettings.groups;
        const resetSettings = {
            ...DEFAULT_SETTINGS,
            groups: currentGroups, // 保留用户的书签和分组
        };
        setTempSettings(resetSettings);
        setResetConfirmDialog({ isOpen: false });
        setAlertConfig({
            isOpen: true,
            title: '设置已还原',
            message: '所有设置已还原为默认值，但您的书签和分组已保留。点击"保存更改"以应用。'
        });
    };

    const activeGroupTitle = activeGroupId === ALL_GROUP_ID
        ? '所有链接'
        : (tempSettings.groups.find(g => g.id === activeGroupId)?.title || '未选择分组');

    return {
        activeTab,
        setActiveTab,
        tempSettings,
        setTempSettings,
        activeGroupId,
        setActiveGroupId,
        isImportMode,
        setIsImportMode,
        isFetchingBookmarks,
        bookmarkCandidates,
        selectedCandidateIds,
        searchTerm,
        setSearchTerm,
        backupStatus,
        statusMessage,
        cacheClearStatus,
        updateStatus,
        setUpdateStatus,
        alertConfig,
        setAlertConfig,
        resetConfirmDialog,
        setResetConfirmDialog,
        handleSave,
        startImport,
        confirmImport,
        toggleCandidate,
        toggleSelectAllImport,
        filteredCandidates,
        activeGroupTitle,
        handleBackup,
        handleRestore,
        handleLocalExport,
        handleLocalImport,
        handleClearCache,
        handleResetSettings,
        confirmResetSettings
    };
};
