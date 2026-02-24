import { AlertDialog } from '@/shared/components/AlertDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { BookmarkImportView } from './links/BookmarkImportView';
import { useSettingsModal } from '@/settings/hooks/useSettingsModal';
import type { AppSettings } from '@/types';
import { SettingsFooter } from './layout/SettingsFooter';
import { SettingsFrame } from './layout/SettingsFrame';
import { SettingsHeader } from './layout/SettingsHeader';
import { SettingsTabContent } from './renderers/SettingsTabContent';

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
  const state = useSettingsModal(props);
  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onContextMenu={handleContextMenu}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={props.onClose} />

      <SettingsFrame
        theme={props.theme}
        activeTab={state.activeTab}
        updateStatus={state.updateStatus}
        onTabChange={(tab) => {
          state.setActiveTab(tab);
          state.setIsImportMode(false);
        }}
      >
        <div className={`flex-1 flex flex-col min-w-0 ${props.theme === 'light' ? 'bg-white' : 'bg-[#25262b]/50'}`}>
          <SettingsHeader activeTab={state.activeTab} theme={props.theme} onClose={props.onClose} />

          {state.isImportMode ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              <BookmarkImportView groupTitle={state.activeGroupTitle} searchTerm={state.searchTerm} onSearchChange={state.setSearchTerm} candidates={state.filteredCandidates} selectedIds={state.selectedCandidateIds} onToggle={state.toggleCandidate} onSelectAll={state.toggleSelectAllImport} onConfirm={state.confirmImport} onCancel={() => state.setIsImportMode(false)} theme={props.theme} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-5xl mx-auto w-full animate-fade-in">
                <SettingsTabContent
                  activeTab={state.activeTab}
                  theme={props.theme}
                  backgroundImage={props.backgroundImage}
                  tempSettings={state.tempSettings}
                  activeGroupId={state.activeGroupId}
                  isFetchingBookmarks={state.isFetchingBookmarks}
                  cacheClearStatus={state.cacheClearStatus}
                  onSettingsChange={state.setTempSettings}
                  onGroupChange={state.setActiveGroupId}
                  onStartImport={state.startImport}
                  onClearCache={state.handleClearCache}
                  onResetSettings={state.handleResetSettings}
                  onSaveWallpaper={props.onSaveWallpaper}
                  onBackup={state.handleBackup}
                  onRestore={state.handleRestore}
                  onExport={state.handleLocalExport}
                  onImport={state.handleLocalImport}
                  backupStatus={{ type: state.backupStatus, message: state.statusMessage }}
                  onUpdateStatusChange={state.setUpdateStatus}
                />
              </div>
            </div>
          )}

          {!state.isImportMode && <SettingsFooter theme={props.theme} onCancel={props.onClose} onSave={state.handleSave} />}
        </div>
      </SettingsFrame>

      <AlertDialog isOpen={state.alertConfig.isOpen} title={state.alertConfig.title} message={state.alertConfig.message} theme={props.theme} onClose={() => state.setAlertConfig((previous) => ({ ...previous, isOpen: false }))} />
      <ConfirmDialog isOpen={state.resetConfirmDialog.isOpen} title="还原所有设置" message="此操作会将设置恢复为默认值，并保留分组与链接。确认继续吗？" confirmText="确认还原" theme={props.theme} onClose={() => state.setResetConfirmDialog({ isOpen: false })} onConfirm={state.confirmResetSettings} />
    </div>
  );
};
