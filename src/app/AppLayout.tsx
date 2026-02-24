import { ContextMenu } from '@/context-menu';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { GroupEditDialog } from '@/features/links/dialogs/GroupEditDialog';
import { LinkEditDialog } from '@/features/links/dialogs/LinkEditDialog';
import { LinkGrid } from '@/features/links/grid/LinkGrid';
import { SearchBar } from '@/features/search/SearchBar';
import { Clock } from '@/features/widgets/Clock';
import { SettingsModal } from '@/settings/SettingsModal';
import type { ContextMenuState } from '@/context-menu';
import type { AppSettings, HideOptions, Link, Theme } from '@/types';

interface AppLayoutProps {
  settings: AppSettings;
  theme: Theme;
  backgroundImage: string;
  isEditMode: boolean;
  isSettingsOpen: boolean;
  contextMenu: ContextMenuState;
  editingLink: { link: Link; groupId: string } | null;
  editingGroup: { groupId: string; title: string } | null;
  confirmDialog: { isOpen: boolean; title: string; message: string; onConfirm: () => void } | null;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>>;
  setEditingLink: React.Dispatch<React.SetStateAction<{ link: Link; groupId: string } | null>>;
  setEditingGroup: React.Dispatch<React.SetStateAction<{ groupId: string; title: string } | null>>;
  onContextBlank: (event: React.MouseEvent) => void;
  onToggleTheme: () => void;
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  onReorderLinks: (payload: import('@/features/links/grid/types').ReorderPayload) => Promise<void>;
  onToggleCollapse: (groupId: string) => Promise<void>;
  onLinkContextMenu: (event: React.MouseEvent, link: Link, groupId: string) => void;
  onGroupContextMenu: (event: React.MouseEvent, groupId: string) => void;
  onDeleteLink: (link: Link, groupId: string) => void;
  onCloseMenu: () => void;
  onToggleEditMode: () => void;
  onEditLink: (link: Link, groupId: string) => void;
  onSaveLink: (updated: Link) => Promise<void>;
  onEditGroup: (groupId: string) => void;
  onSaveGroup: (groupId: string, title: string) => Promise<void>;
  onToggleHideOption: (option: keyof HideOptions) => Promise<void>;
  onToggleAllVisibility: () => Promise<void>;
  onSaveWallpaper: () => Promise<void>;
}

export const AppLayout: React.FC<AppLayoutProps> = (props) => {
  const isLight = props.theme === 'light';
  const blurAmount = Math.min(24, Math.max(0, props.settings.bgBlurAmount ?? 8));
  const darkMaskOpacity = Math.min(100, Math.max(0, props.settings.darkMaskOpacity ?? 40));

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-gray-900 font-sans ${!isLight ? 'dark' : ''}`} onContextMenu={props.onContextBlank}>
      <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 pointer-events-none" style={{ backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'none', opacity: props.backgroundImage ? 1 : 0, filter: `brightness(${props.settings.bgBlur ? 0.85 : 1}) blur(${props.settings.bgBlur ? `${blurAmount}px` : '0px'})` }} />
      {!isLight && props.settings.enableDarkMask && <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000" style={{ backgroundColor: props.backgroundImage ? `rgba(0, 0, 0, ${darkMaskOpacity / 100})` : '#0f1115' }} />}

      <div className={`absolute inset-0 z-10 ${props.settings.linkDisplayMode === 'pagination' ? 'overflow-hidden' : 'overflow-y-auto'} custom-scrollbar`}>
        <div className="min-h-full w-full flex flex-col items-center py-12">
          <div className="flex flex-col items-center gap-10 w-full max-w-6xl px-4 my-auto animate-fade-in">
            {(!props.settings.hideOptions?.hideClock || !props.settings.hideOptions?.hideDate) && (
              <div className="flex-shrink-0 flex flex-col items-center gap-8 w-full">
                <Clock showTime={!props.settings.hideOptions?.hideClock} showDate={!props.settings.hideOptions?.hideDate} showSeconds={props.settings.showSeconds} />
                {!props.settings.hideOptions?.hideSearchBox && <SearchBar engine={props.settings.searchEngine} onEngineChange={(engine) => void props.onSaveSettings({ ...props.settings, searchEngine: engine })} theme={props.theme} />}
              </div>
            )}

            {!props.settings.hideOptions?.hideAllLinks && (
              <LinkGrid groups={props.settings.groups || []} theme={props.theme} isEditMode={props.isEditMode} linkDisplayMode={props.settings.linkDisplayMode} onReorderLinks={(payload) => void props.onReorderLinks(payload)} onLinkContextMenu={props.onLinkContextMenu} onToggleCollapse={(groupId) => void props.onToggleCollapse(groupId)} onGroupContextMenu={props.onGroupContextMenu} forceHideGroupNames={props.settings.hideOptions?.hideGroupNames} onDeleteLink={props.onDeleteLink} />
            )}
          </div>
          <div className="h-24 flex-shrink-0 w-full" />
        </div>
      </div>

      {props.isEditMode && <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full backdrop-blur-xl shadow-lg border ${isLight ? 'bg-white/90 border-gray-200 text-gray-600' : 'bg-gray-900/90 border-gray-700 text-gray-300'}`}><span className="text-sm font-medium">拖拽排序模式</span><button onClick={() => props.setIsEditMode(false)} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${isLight ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>完成</button></div>}

      {!props.settings.hideOptions?.hideButtons && <button onClick={props.onToggleTheme} className={`absolute top-6 right-6 z-20 p-3 rounded-full backdrop-blur-xl border shadow-2xl ${isLight ? 'bg-white/70 text-orange-600 border-orange-200/50' : 'bg-gray-900/70 text-yellow-400 border-yellow-500/30'}`}>{isLight ? '☀' : '☾'}</button>}
      {!props.settings.hideOptions?.hideButtons && <button onClick={() => props.setIsSettingsOpen(true)} className={`absolute bottom-6 left-6 z-20 p-3 rounded-full backdrop-blur-md border shadow-lg ${isLight ? 'bg-white/50 text-gray-700 border-white/20' : 'bg-black/20 text-white/70 border-white/5'}`}>⚙</button>}

      <ContextMenu state={props.contextMenu} theme={props.theme} isEditMode={props.isEditMode} hideOptions={props.settings.hideOptions} onClose={props.onCloseMenu} onToggleTheme={props.onToggleTheme} onToggleEditMode={props.onToggleEditMode} onEditLink={props.onEditLink} onDeleteLink={props.onDeleteLink} onEditGroup={props.onEditGroup} onToggleHideOption={(option) => void props.onToggleHideOption(option)} onToggleAllVisibility={() => void props.onToggleAllVisibility()} onOpenSettings={() => props.setIsSettingsOpen(true)} onSaveWallpaper={() => void props.onSaveWallpaper()} />

      {props.editingLink && <LinkEditDialog isOpen={true} link={props.editingLink.link} theme={props.theme} onClose={() => props.setEditingLink(null)} onSave={(updated) => void props.onSaveLink(updated)} />}
      {props.editingGroup && <GroupEditDialog isOpen={true} groupId={props.editingGroup.groupId} currentTitle={props.editingGroup.title} theme={props.theme} onClose={() => props.setEditingGroup(null)} onSave={(groupId, title) => void props.onSaveGroup(groupId, title)} />}
      <ConfirmDialog isOpen={props.confirmDialog?.isOpen || false} title={props.confirmDialog?.title || ''} message={props.confirmDialog?.message || ''} theme={props.theme} onClose={() => props.setConfirmDialog(null)} onConfirm={() => props.confirmDialog?.onConfirm()} />
      {props.isSettingsOpen && <SettingsModal isOpen={props.isSettingsOpen} onClose={() => props.setIsSettingsOpen(false)} settings={props.settings} onSave={(next) => void props.onSaveSettings(next)} theme={props.theme} onSaveWallpaper={() => void props.onSaveWallpaper()} backgroundImage={props.backgroundImage} />}
    </div>
  );
};
