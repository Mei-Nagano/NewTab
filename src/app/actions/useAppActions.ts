import type { ContextMenuState } from '@/context-menu';
import { reorderLinksAcrossGroups, reorderLinksInGroup } from '@/shared/utils';
import { saveSettings } from '@/services/storage';
import type { AppSettings, HideOptions, Link, Theme } from '@/types';
import type { ReorderPayload } from '@/features/links/grid/types';

interface UseAppActionsParams {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  adaptiveTheme: Theme;
  setAdaptiveTheme: React.Dispatch<React.SetStateAction<Theme>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>;
  setEditingLink: React.Dispatch<React.SetStateAction<{ link: Link; groupId: string } | null>>;
  setEditingGroup: React.Dispatch<React.SetStateAction<{ groupId: string; title: string } | null>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>>;
}

const DEFAULT_HIDE_OPTIONS: HideOptions = {
  hideAllLinks: false,
  hideGroupNames: false,
  hideSearchBox: false,
  hideButtons: false,
  hideDate: false,
  hideClock: false,
};

export const useAppActions = ({
  settings,
  setSettings,
  adaptiveTheme,
  setAdaptiveTheme,
  setContextMenu,
  setEditingLink,
  setEditingGroup,
  setConfirmDialog,
}: UseAppActionsParams) => {
  const saveAndApply = async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
  };

  const askDeleteLink = (link: Link, groupId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除网站',
      message: `确定删除「${link.title}」吗？此操作不可撤销。`,
      onConfirm: () => {
        const groups = settings.groups.map((group) =>
          group.id === groupId ? { ...group, links: group.links.filter((item) => item.id !== link.id) } : group
        );
        void saveAndApply({ ...settings, groups });
      },
    });
  };

  return {
    saveSettings: saveAndApply,
    reorderLinks: async (payload: ReorderPayload) => {
      const shouldCross = !!payload.targetGroupId && payload.targetGroupId !== payload.sourceGroupId;
      const groups = settings.linkDisplayMode === 'pagination' || shouldCross
        ? reorderLinksAcrossGroups(settings.groups, payload.activeId, payload.overId)
        : reorderLinksInGroup(settings.groups, payload.sourceGroupId, payload.activeId, payload.overId);
      await saveAndApply({ ...settings, groups });
    },
    toggleCollapse: async (groupId: string) => {
      const groups = settings.groups.map((group) => (group.id === groupId ? { ...group, collapsed: !group.collapsed } : group));
      await saveAndApply({ ...settings, groups });
    },
    toggleTheme: () => {
      const nextTheme: Theme = adaptiveTheme === 'light' ? 'dark' : 'light';
      setAdaptiveTheme(nextTheme);
      void saveAndApply({ ...settings, theme: nextTheme });
    },
    openLinkMenu: (event: React.MouseEvent, link: Link, groupId: string) => {
      event.preventDefault();
      setContextMenu({ visible: true, x: event.clientX, y: event.clientY, type: 'link', targetLink: link, targetGroupId: groupId });
    },
    openGroupMenu: (event: React.MouseEvent, groupId: string) => {
      event.preventDefault();
      setContextMenu({ visible: true, x: event.clientX, y: event.clientY, type: 'group', targetGroupId: groupId });
    },
    openBlankMenu: (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('a') || target.closest('[data-link-item]')) return;
      event.preventDefault();
      setContextMenu({ visible: true, x: event.clientX, y: event.clientY, type: 'blank' });
    },
    closeMenu: () => setContextMenu((previous) => ({ ...previous, visible: false })),
    editLink: (link: Link, groupId: string) => setEditingLink({ link, groupId }),
    saveLink: async (editingLink: { link: Link; groupId: string } | null, updated: Link) => {
      if (!editingLink) return;
      const groups = settings.groups.map((group) =>
        group.id === editingLink.groupId
          ? { ...group, links: group.links.map((item) => (item.id === updated.id ? updated : item)) }
          : group
      );
      await saveAndApply({ ...settings, groups });
      setEditingLink(null);
    },
    toggleHideOption: async (option: keyof HideOptions) => {
      const hideOptions = settings.hideOptions || DEFAULT_HIDE_OPTIONS;
      await saveAndApply({ ...settings, hideOptions: { ...hideOptions, [option]: !hideOptions[option] } });
    },
    toggleAllVisibility: async () => {
      const current = settings.hideOptions || DEFAULT_HIDE_OPTIONS;
      const allHidden = Object.values(current).every(Boolean);
      await saveAndApply({ ...settings, hideOptions: Object.keys(current).reduce((acc, key) => ({ ...acc, [key]: !allHidden }), {} as HideOptions) });
    },
    editGroup: (groupId: string) => {
      const group = settings.groups.find((item) => item.id === groupId);
      if (group) setEditingGroup({ groupId, title: group.title });
    },
    saveGroup: async (groupId: string, title: string) => {
      const groups = settings.groups.map((group) => (group.id === groupId ? { ...group, title } : group));
      await saveAndApply({ ...settings, groups });
      setEditingGroup(null);
    },
    saveWallpaper: async (backgroundImage: string) => {
      if (!backgroundImage) return;
      try {
        const response = await fetch(backgroundImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wallpaper-${new Date().toISOString().split('T')[0]}.${blob.type.split('/')[1] || 'jpg'}`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch {
        const link = document.createElement('a');
        link.href = backgroundImage;
        link.download = `wallpaper-${Date.now()}`;
        link.click();
      }
    },
    askDeleteLink,
  };
};
