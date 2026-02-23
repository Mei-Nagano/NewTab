import { useEffect, useRef, useState } from 'react';
import type { PaginationState } from '../types';

interface UseGridPaginationParams {
  isPagination: boolean;
  totalItems: number;
  resetKey: string;
}

interface UseGridPaginationResult extends PaginationState {
  isExpanded: boolean;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  paginate: <T>(items: T[]) => T[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const useGridPagination = ({
  isPagination,
  totalItems,
  resetKey,
}: UseGridPaginationParams): UseGridPaginationResult => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [isExpanded, setIsExpanded] = useState(true);
  const collapseTimerRef = useRef<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (!isPagination) return;

    const calculateLayout = () => {
      const rows = Math.max(1, Math.floor((window.innerHeight - 420) / 130));
      setItemsPerPage(rows * 8);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [isPagination]);

  useEffect(() => {
    setCurrentPage(0);
  }, [resetKey]);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isPagination || totalPages <= 1) {
      setIsExpanded(true);
      return;
    }

    setIsExpanded(true);
    collapseTimerRef.current = window.setTimeout(() => setIsExpanded(false), 3000);
    return () => {
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
      }
    };
  }, [isPagination, totalPages]);

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    isExpanded,
    setCurrentPage,
    paginate: (items) => (isPagination ? items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) : items),
    onMouseEnter: () => {
      clearCollapseTimer();
      setIsExpanded(true);
    },
    onMouseLeave: () => {
      clearCollapseTimer();
      setIsExpanded(false);
    },
  };
};
