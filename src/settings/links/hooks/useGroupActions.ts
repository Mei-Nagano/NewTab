import type { AppSettings, LinkGroup } from '@/types';
import { ALL_GROUP_ID } from '../constants';

interface UseGroupActionsParams {
  settings: AppSettings;
  activeGroupId: string;
  isAllGroupSelected: boolean;
  onSettingsChange: (settings: AppSettings) => void;
  setActiveGroupId: (id: string) => void;
}

export const useGroupActions = ({
  settings,
  activeGroupId,
  isAllGroupSelected,
  onSettingsChange,
  setActiveGroupId,
}: UseGroupActionsParams) => {
  const addGroup = () => {
    const newGroup: LinkGroup = {
      id: `g-${Date.now()}`,
      title: '新分组',
      links: [],
    };
    onSettingsChange({ ...settings, groups: [...settings.groups, newGroup] });
    setActiveGroupId(newGroup.id);
  };

  const renameGroup = (groupId: string, title: string) => {
    if (groupId === ALL_GROUP_ID || !title.trim()) return;
    onSettingsChange({
      ...settings,
      groups: settings.groups.map((group) =>
        group.id === groupId ? { ...group, title: title.trim() } : group
      ),
    });
  };

  const canDeleteActiveGroup = !isAllGroupSelected && activeGroupId !== ALL_GROUP_ID && settings.groups.length > 1;

  const deleteGroup = (groupId: string) => {
    if (!canDeleteActiveGroup || groupId === ALL_GROUP_ID) return;
    const remaining = settings.groups.filter((group) => group.id !== groupId);
    onSettingsChange({ ...settings, groups: remaining });
    if (groupId === activeGroupId && remaining.length > 0) {
      setActiveGroupId(remaining[0].id);
    }
  };

  return {
    addGroup,
    renameGroup,
    deleteGroup,
    canDeleteActiveGroup,
  };
};
