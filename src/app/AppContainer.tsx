import { useState } from 'react';
import { AppLayout } from './AppLayout';
import { useAppActions } from './actions/useAppActions';
import { useAppBootstrap } from './hooks/useAppBootstrap';
import { useBackgroundManager } from './hooks/useBackgroundManager';
import { useThemeSync } from './hooks/useThemeSync';
import type { ContextMenuState } from '@/components/ContextMenu';
import type { Link } from '@/types';

export const AppContainer: React.FC = () => {
  const { settings, setSettings, loaded, adaptiveTheme, setAdaptiveTheme } = useAppBootstrap();
  const backgroundImage = useBackgroundManager(settings, loaded);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, type: 'blank' });
  const [editingLink, setEditingLink] = useState<{ link: Link; groupId: string } | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ groupId: string; title: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const actions = useAppActions({
    settings,
    setSettings,
    adaptiveTheme,
    setAdaptiveTheme,
    setContextMenu,
    setEditingLink,
    setEditingGroup,
    setConfirmDialog,
  });

  useThemeSync(adaptiveTheme);
  if (!loaded) return <div className="w-screen h-screen bg-gray-900" />;

  return (
    <AppLayout
      settings={settings}
      theme={adaptiveTheme}
      backgroundImage={backgroundImage}
      isEditMode={isEditMode}
      isSettingsOpen={isSettingsOpen}
      contextMenu={contextMenu}
      editingLink={editingLink}
      editingGroup={editingGroup}
      confirmDialog={confirmDialog}
      setIsEditMode={setIsEditMode}
      setIsSettingsOpen={setIsSettingsOpen}
      setConfirmDialog={setConfirmDialog}
      setEditingLink={setEditingLink}
      setEditingGroup={setEditingGroup}
      onContextBlank={actions.openBlankMenu}
      onToggleTheme={actions.toggleTheme}
      onSaveSettings={actions.saveSettings}
      onReorderLinks={actions.reorderLinks}
      onToggleCollapse={actions.toggleCollapse}
      onLinkContextMenu={actions.openLinkMenu}
      onGroupContextMenu={actions.openGroupMenu}
      onDeleteLink={actions.askDeleteLink}
      onCloseMenu={actions.closeMenu}
      onToggleEditMode={() => setIsEditMode((previous) => !previous)}
      onEditLink={actions.editLink}
      onSaveLink={(updated) => actions.saveLink(editingLink, updated)}
      onEditGroup={actions.editGroup}
      onSaveGroup={actions.saveGroup}
      onToggleHideOption={actions.toggleHideOption}
      onToggleAllVisibility={actions.toggleAllVisibility}
      onSaveWallpaper={() => actions.saveWallpaper(backgroundImage)}
    />
  );
};
