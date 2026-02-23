import { useState } from 'react';

export const useSelection = () => {
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedLinkIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetSelection = () => setSelectedLinkIds(new Set());

  const toggleSelectAll = (ids: string[]) => {
    setSelectedLinkIds((previous) => {
      if (previous.size === ids.length && ids.length > 0) {
        return new Set();
      }
      return new Set(ids);
    });
  };

  return {
    selectedLinkIds,
    setSelectedLinkIds,
    toggleSelection,
    resetSelection,
    toggleSelectAll,
  };
};
