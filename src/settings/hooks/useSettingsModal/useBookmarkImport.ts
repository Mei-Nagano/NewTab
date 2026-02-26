import { useMemo, useState } from 'react';
import type { AppSettings, Link, LinkGroup } from '@/types';
import { getBrowserBookmarkFolders } from '@/services/storage';
import type { BrowserBookmarkFolder } from '@/services/storage/bookmarkStore';
import type { AlertConfig } from './types';

export type BookmarkImportTarget = 'current-group' | 'new-groups';

export interface BrowserBookmarkFolderView extends BrowserBookmarkFolder {
  visibleLinks: Link[];
}

interface UseBookmarkImportParams {
  activeGroupId: string;
  setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  setAlertConfig: React.Dispatch<React.SetStateAction<AlertConfig>>;
}

const buildImportedLink = (link: Link): Link => ({
  ...link,
  id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
});

const createUniqueGroupTitle = (baseTitle: string, usedTitles: Set<string>): string => {
  const normalized = baseTitle.trim() || '导入分组';
  if (!usedTitles.has(normalized)) return normalized;

  let index = 2;
  while (usedTitles.has(`${normalized} (${index})`)) index += 1;
  return `${normalized} (${index})`;
};

export const useBookmarkImport = ({
  activeGroupId,
  setTempSettings,
  setAlertConfig,
}: UseBookmarkImportParams) => {
  const [isImportMode, setIsImportMode] = useState(false);
  const [isFetchingBookmarks, setIsFetchingBookmarks] = useState(false);
  const [bookmarkFolders, setBookmarkFolders] = useState<BrowserBookmarkFolder[]>([]);
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [importTarget, setImportTarget] = useState<BookmarkImportTarget>('current-group');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFolders = useMemo<BrowserBookmarkFolderView[]>(() => {
    const lower = searchTerm.toLowerCase();
    if (!lower) {
      return bookmarkFolders.map((folder) => ({ ...folder, visibleLinks: folder.links }));
    }

    return bookmarkFolders
      .map((folder) => {
        const titleMatched = folder.title.toLowerCase().includes(lower);
        const visibleLinks = titleMatched
          ? folder.links
          : folder.links.filter(
            (link) =>
              link.title.toLowerCase().includes(lower) || link.url.toLowerCase().includes(lower)
          );
        return { ...folder, visibleLinks };
      })
      .filter((folder) => folder.visibleLinks.length > 0);
  }, [bookmarkFolders, searchTerm]);

  const visibleLinkIds = useMemo(
    () => filteredFolders.flatMap((folder) => folder.visibleLinks.map((link) => link.id)),
    [filteredFolders]
  );

  const clearImportState = () => {
    setIsImportMode(false);
    setBookmarkFolders([]);
    setSelectedLinkIds(new Set());
    setExpandedFolderIds(new Set());
    setSearchTerm('');
    setImportTarget('current-group');
  };

  const startImport = async () => {
    setIsFetchingBookmarks(true);
    try {
      const folders = await getBrowserBookmarkFolders();
      if (folders.length === 0) {
        setAlertConfig({ isOpen: true, title: '提示', message: '未找到可导入的书签分组。' });
        return;
      }

      setBookmarkFolders(folders);
      setSelectedLinkIds(new Set());
      setExpandedFolderIds(new Set(folders.slice(0, 3).map((folder) => folder.id)));
      setImportTarget('current-group');
      setSearchTerm('');
      setIsImportMode(true);
    } catch (error) {
      console.error(error);
      setAlertConfig({ isOpen: true, title: '错误', message: '获取书签失败，请检查权限。' });
    } finally {
      setIsFetchingBookmarks(false);
    }
  };

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolderIds((previous) => {
      const next = new Set(previous);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const toggleLink = (linkId: string) => {
    setSelectedLinkIds((previous) => {
      const next = new Set(previous);
      if (next.has(linkId)) next.delete(linkId);
      else next.add(linkId);
      return next;
    });
  };

  const toggleFolderLinks = (folderId: string) => {
    const folder = filteredFolders.find((item) => item.id === folderId);
    if (!folder) return;
    const linkIds = folder.visibleLinks.map((link) => link.id);

    setSelectedLinkIds((previous) => {
      const next = new Set(previous);
      const allSelected = linkIds.every((id) => next.has(id));
      linkIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const toggleSelectAllImport = () => {
    setSelectedLinkIds((previous) => {
      const next = new Set(previous);
      const allVisibleSelected = visibleLinkIds.length > 0 && visibleLinkIds.every((id) => previous.has(id));
      visibleLinkIds.forEach((id) => {
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const confirmImport = () => {
    if (selectedLinkIds.size === 0) return;

    const folderSelection = bookmarkFolders
      .map((folder) => ({
        folder,
        links: folder.links.filter((link) => selectedLinkIds.has(link.id)),
      }))
      .filter((item) => item.links.length > 0);

    if (folderSelection.length === 0) return;

    setTempSettings((previous) => {
      if (importTarget === 'current-group') {
        const targetExists = previous.groups.some((group) => group.id === activeGroupId);
        if (!targetExists) {
          setAlertConfig({ isOpen: true, title: '提示', message: '当前分组不存在，请重新选择后再导入。' });
          return previous;
        }

        return {
          ...previous,
          groups: previous.groups.map((group) =>
            group.id === activeGroupId
              ? { ...group, links: [...group.links, ...folderSelection.flatMap((item) => item.links.map(buildImportedLink))] }
              : group
          ),
        };
      }

      const usedTitles = new Set(previous.groups.map((group) => group.title));
      const importedGroups: LinkGroup[] = folderSelection.map(({ folder, links }, index) => {
        const title = createUniqueGroupTitle(folder.title, usedTitles);
        usedTitles.add(title);
        return {
          id: `g-import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          links: links.map(buildImportedLink),
        };
      });

      return {
        ...previous,
        groups: [...previous.groups, ...importedGroups],
      };
    });

    clearImportState();
  };

  return {
    isImportMode,
    setIsImportMode,
    isFetchingBookmarks,
    bookmarkFolders,
    selectedLinkIds,
    expandedFolderIds,
    importTarget,
    setImportTarget,
    searchTerm,
    setSearchTerm,
    filteredFolders,
    startImport,
    toggleFolderExpand,
    toggleFolderLinks,
    toggleLink,
    toggleSelectAllImport,
    confirmImport,
  };
};
