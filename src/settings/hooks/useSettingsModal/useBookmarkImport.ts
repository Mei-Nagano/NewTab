import { useMemo, useState } from 'react';
import type { AppSettings, Link } from '@/types';
import { getBrowserBookmarks } from '@/services/storage';
import type { AlertConfig } from './types';

interface UseBookmarkImportParams {
  activeGroupId: string;
  setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  setAlertConfig: React.Dispatch<React.SetStateAction<AlertConfig>>;
}

export const useBookmarkImport = ({
  activeGroupId,
  setTempSettings,
  setAlertConfig,
}: UseBookmarkImportParams) => {
  const [isImportMode, setIsImportMode] = useState(false);
  const [isFetchingBookmarks, setIsFetchingBookmarks] = useState(false);
  const [bookmarkCandidates, setBookmarkCandidates] = useState<Link[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const startImport = async () => {
    setIsFetchingBookmarks(true);
    try {
      const bookmarks = await getBrowserBookmarks();
      if (bookmarks.length === 0) {
        setAlertConfig({ isOpen: true, title: '提示', message: '未找到可导入书签。' });
        return;
      }
      setBookmarkCandidates(bookmarks);
      setSelectedCandidateIds(new Set());
      setSearchTerm('');
      setIsImportMode(true);
    } catch (error) {
      console.error(error);
      setAlertConfig({ isOpen: true, title: '错误', message: '获取书签失败，请检查权限。' });
    } finally {
      setIsFetchingBookmarks(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return bookmarkCandidates.filter((item) => item.title.toLowerCase().includes(lower) || item.url.toLowerCase().includes(lower));
  }, [bookmarkCandidates, searchTerm]);

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllImport = () => {
    setSelectedCandidateIds((previous) => {
      if (previous.size === filteredCandidates.length && filteredCandidates.length > 0) {
        return new Set();
      }
      return new Set(filteredCandidates.map((item) => item.id));
    });
  };

  const confirmImport = () => {
    const imported = bookmarkCandidates
      .filter((item) => selectedCandidateIds.has(item.id))
      .map((item) => ({
        ...item,
        id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      }));

    setTempSettings((previous) => ({
      ...previous,
      groups: previous.groups.map((group) =>
        group.id === activeGroupId ? { ...group, links: [...group.links, ...imported] } : group
      ),
    }));

    setIsImportMode(false);
    setBookmarkCandidates([]);
    setSelectedCandidateIds(new Set());
  };

  return {
    isImportMode,
    setIsImportMode,
    isFetchingBookmarks,
    bookmarkCandidates,
    selectedCandidateIds,
    searchTerm,
    setSearchTerm,
    filteredCandidates,
    startImport,
    toggleCandidate,
    toggleSelectAllImport,
    confirmImport,
  };
};
