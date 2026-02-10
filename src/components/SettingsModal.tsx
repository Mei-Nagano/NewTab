import React from 'react';
import type { AppSettings } from '../constants';
import { GeneralTab } from './settings/GeneralTab';
import { LinksTab } from './settings/LinksTab';
import { BackupTab } from './settings/BackupTab';
import { ToolsTab } from './settings/ToolsTab';
import { BookmarkImportView } from './settings/BookmarkImportView';
import { AboutTab } from './settings/AboutTab';
import { AlertDialog } from './common/AlertDialog';
import { ConfirmDialog } from './common/ConfirmDialog';
import { useSettingsModal } from './settings/hooks/useSettingsModal';
import { SettingsSidebar } from './settings/SettingsSidebar';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
    theme: 'light' | 'dark';
    onSaveWallpaper?: () => void;
    backgroundImage?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
    const { isOpen, onClose, theme } = props;
    
    // Use the custom hook for logic
    const {
        activeTab,
        setActiveTab,
        tempSettings,
        setTempSettings,
        activeGroupId,
        setActiveGroupId,
        isImportMode,
        setIsImportMode,
        isFetchingBookmarks,
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
    } = useSettingsModal(props);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className={`relative w-full max-w-5xl h-[85vh] border rounded-2xl shadow-2xl overflow-hidden flex animate-slide-up transition-colors duration-300 ${
                theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1b1e] border-white/5'
            }`}>

                {/* Sidebar */}
                <SettingsSidebar 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    theme={theme}
                    updateStatus={updateStatus}
                    onTabChange={() => setIsImportMode(false)}
                />

                {/* Content Area */}
                <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
                    theme === 'light' ? 'bg-white' : 'bg-[#25262b]/50'
                }`}>
                    {/* Toolbar / Header within content */}
                    <div className={`h-16 flex items-center justify-between px-8 border-b flex-shrink-0 transition-colors ${
                        theme === 'light' ? 'border-gray-100' : 'border-white/5'
                    }`}>
                        <h3 className={`text-lg font-medium ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>
                            {activeTab === 'general' ? '常规设置' : activeTab === 'links' ? '链接管理' : activeTab === 'backup' ? '备份与恢复' : activeTab === 'tools' ? '实用工具' : '关于'}
                        </h3>

                        <button
                            onClick={onClose}
                            className={`p-2 -mr-2 rounded-lg transition-colors ${
                                theme === 'light' ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                                        onResetSettings={handleResetSettings}
                                        onSaveWallpaper={props.onSaveWallpaper}
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
                                {activeTab === 'tools' && (
                                    <ToolsTab theme={theme} backgroundImage={props.backgroundImage} />
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
                        <div className={`px-8 py-5 border-t flex items-center justify-end gap-3 backdrop-blur-sm flex-shrink-0 transition-colors ${
                            theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-[#1a1b1e]/50 border-white/5'
                        }`}>
                            <button
                                onClick={onClose}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    theme === 'light' ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/5'
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

            <ConfirmDialog
                isOpen={resetConfirmDialog.isOpen}
                title="还原所有设置"
                message="此操作将重置所有设置为默认值，但会保留您的书签和分组。确定要继续吗？"
                confirmText="确定还原"
                theme={theme}
                onClose={() => setResetConfirmDialog({ isOpen: false })}
                onConfirm={confirmResetSettings}
            />
        </div>
    );
};
