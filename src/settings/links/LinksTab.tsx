import { useEffect, useMemo, useState } from 'react';
import { AlertDialog } from '@/shared/components/AlertDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { AppSettings, Link } from '@/types';
import { ALL_GROUP_ID, ALL_GROUP_TITLE } from './constants';
import { ZH_CN_TEXTS } from '@/shared/texts/zh-CN';
import { useGroupActions } from './hooks/useGroupActions';
import { useLinkActions } from './hooks/useLinkActions';
import { useSelection } from './hooks/useSelection';
import { GroupSection } from './sections/GroupSection';
import { LinkFormSection } from './sections/LinkFormSection';
import { LinkListSection } from './sections/LinkListSection';
import type { LinkFormState } from './types';

interface LinksTabProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  onStartImport: () => void;
  isFetchingBookmarks: boolean;
  theme: 'light' | 'dark';
}

const EMPTY_FORM: LinkFormState = { title: '', url: '', icon: '' };

export const LinksTab: React.FC<LinksTabProps> = ({
  settings,
  onSettingsChange,
  activeGroupId,
  setActiveGroupId,
  onStartImport,
  isFetchingBookmarks,
  theme,
}) => {
  const [form, setForm] = useState<LinkFormState>(EMPTY_FORM);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState('');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' });

  const isAllGroupSelected = activeGroupId === ALL_GROUP_ID;
  const allLinks = useMemo(() => settings.groups.flatMap((group) => group.links), [settings.groups]);
  const activeGroup = useMemo(
    () =>
      isAllGroupSelected
        ? { id: ALL_GROUP_ID, title: ALL_GROUP_TITLE, links: allLinks }
        : settings.groups.find((group) => group.id === activeGroupId) || settings.groups[0],
    [isAllGroupSelected, allLinks, settings.groups, activeGroupId]
  );

  const selection = useSelection();
  const groupActions = useGroupActions({ settings, activeGroupId, isAllGroupSelected, onSettingsChange, setActiveGroupId });
  const linkActions = useLinkActions({ settings, activeGroupId, isAllGroupSelected, onSettingsChange });

  useEffect(() => {
    if (!activeGroup) return;
    setEditingGroupTitle(isAllGroupSelected ? ALL_GROUP_TITLE : activeGroup.title);
    setForm(EMPTY_FORM);
    setEditingLinkId(null);
    selection.resetSelection();
  }, [activeGroup?.id, isAllGroupSelected]);

  const handleDeleteGroup = (groupId: string) => {
    if (groupId === ALL_GROUP_ID || isAllGroupSelected) {
      setAlertDialog({ isOpen: true, title: '无法删除', message: ZH_CN_TEXTS.groups.cannotDeleteAll });
      return;
    }
    if (settings.groups.length <= 1) {
      setAlertDialog({ isOpen: true, title: '无法删除', message: '至少需要保留一个分组。' });
      return;
    }
    const group = settings.groups.find((item) => item.id === groupId);
    setConfirmDialog({
      isOpen: true,
      title: '删除分组',
      message: `确定删除“${group?.title || '该分组'}”及其链接吗？`,
      onConfirm: () => groupActions.deleteGroup(groupId),
    });
  };

  const handleSubmitLink = () => { linkActions.saveLink(form, editingLinkId); setForm(EMPTY_FORM); setEditingLinkId(null); };
  const startEditLink = (link: Link) => { if (isAllGroupSelected) return; setForm({ title: link.title, url: link.url, icon: link.icon || '' }); setEditingLinkId(link.id); };

  if (!activeGroup) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <GroupSection
        theme={theme}
        groups={settings.groups}
        activeGroupId={activeGroupId}
        isAllGroupSelected={isAllGroupSelected}
        isDropdownOpen={isGroupDropdownOpen}
        isFetchingBookmarks={isFetchingBookmarks}
        editingGroupTitle={editingGroupTitle}
        onToggleDropdown={() => setIsGroupDropdownOpen((previous) => !previous)}
        onSelectGroup={(groupId) => {
          setActiveGroupId(groupId);
          setIsGroupDropdownOpen(false);
        }}
        onAddGroup={groupActions.addGroup}
        onDeleteGroup={handleDeleteGroup}
        onRenameGroup={(title) => {
          setEditingGroupTitle(title);
          groupActions.renameGroup(activeGroupId, title);
        }}
        onStartImport={onStartImport}
      />
      <LinkFormSection
        theme={theme}
        form={form}
        isAllGroupSelected={isAllGroupSelected}
        editingLinkId={editingLinkId}
        onChange={setForm}
        onSubmit={handleSubmitLink}
        onCancelEdit={() => {
          setEditingLinkId(null);
          setForm(EMPTY_FORM);
        }}
      />
      <LinkListSection
        theme={theme}
        links={activeGroup.links}
        selectedLinkIds={selection.selectedLinkIds}
        editingLinkId={editingLinkId}
        isAllGroupSelected={isAllGroupSelected}
        onReorder={(links) => {
          onSettingsChange({
            ...settings,
            groups: settings.groups.map((group) => (group.id === activeGroupId ? { ...group, links } : group)),
          });
        }}
        onToggleSelect={selection.toggleSelection}
        onToggleSelectAll={() => selection.toggleSelectAll(activeGroup.links.map((link) => link.id))}
        onStartEdit={startEditLink}
        onDelete={linkActions.removeLink}
        onDeleteSelected={() => {
          setConfirmDialog({
            isOpen: true,
            title: '删除链接',
            message: `确定删除 ${selection.selectedLinkIds.size} 个选中链接吗？`,
            onConfirm: () => {
              linkActions.removeLinks(selection.selectedLinkIds);
              selection.resetSelection();
            },
          });
        }}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        theme={theme}
        onClose={() => setConfirmDialog((previous) => ({ ...previous, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
      />
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        theme={theme}
        onClose={() => setAlertDialog((previous) => ({ ...previous, isOpen: false }))}
      />
    </div>
  );
};
