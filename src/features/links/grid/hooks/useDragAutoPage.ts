import { useRef } from 'react';
import type { DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import {
  PAGINATION_EDGE_DWELL_MS,
  PAGINATION_EDGE_FORCE_OUTSIDE_OFFSET,
  PAGINATION_EDGE_OUTSIDE_OFFSET,
  PAGINATION_SWITCH_COOLDOWN,
} from '../constants';
import type { LinkWithGroup } from '../types';
import { getPageAfterDragEdge } from '../logic';

interface UseDragAutoPageParams {
  isPagination: boolean;
  isEditMode: boolean;
  totalPages: number;
  currentPage: number;
  hasActiveLink: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

interface UseDragAutoPageResult {
  handleDragStart: (event: DragStartEvent) => number | null;
  handleDragMove: (event: DragMoveEvent, dragStartClientY: number | null) => void;
  resolveActiveLink: (event: DragStartEvent, links: LinkWithGroup[]) => LinkWithGroup | null;
  reset: () => void;
}

const getClientYFromEvent = (event: Event | null): number | null => {
  if (typeof MouseEvent !== 'undefined' && event instanceof MouseEvent) {
    return event.clientY;
  }
  return null;
};

export const useDragAutoPage = ({
  isPagination,
  isEditMode,
  totalPages,
  currentPage,
  hasActiveLink,
  containerRef,
  setCurrentPage,
}: UseDragAutoPageParams): UseDragAutoPageResult => {
  const lastSwitchAtRef = useRef(0);
  const edgeStateRef = useRef<{ edge: 'top' | 'bottom' | null; enteredAt: number }>({
    edge: null,
    enteredAt: 0,
  });

  const reset = () => {
    lastSwitchAtRef.current = 0;
    edgeStateRef.current = { edge: null, enteredAt: 0 };
  };

  const updatePageByDragY = (clientY: number, isOverItem: boolean) => {
    if (!isPagination || !isEditMode || totalPages <= 1 || !hasActiveLink) {
      edgeStateRef.current = { edge: null, enteredAt: 0 };
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const outsideOffset = Math.min(
      PAGINATION_EDGE_OUTSIDE_OFFSET,
      Math.max(12, Math.floor(rect.height * 0.03))
    );

    const topOverflow = rect.top - clientY;
    const bottomOverflow = clientY - rect.bottom;
    const overflowDistance = Math.max(topOverflow, bottomOverflow);

    let edge: 'top' | 'bottom' | null = null;
    if (topOverflow >= outsideOffset) edge = 'top';
    if (bottomOverflow >= outsideOffset) edge = 'bottom';
    if (!edge) {
      edgeStateRef.current = { edge: null, enteredAt: 0 };
      return;
    }

    const forceOutsideOffset = Math.min(
      PAGINATION_EDGE_FORCE_OUTSIDE_OFFSET,
      Math.max(20, Math.floor(rect.height * 0.06))
    );
    if (isOverItem && overflowDistance < forceOutsideOffset) {
      edgeStateRef.current = { edge: null, enteredAt: 0 };
      return;
    }

    const now = Date.now();
    if (edgeStateRef.current.edge !== edge) {
      edgeStateRef.current = { edge, enteredAt: now };
      return;
    }
    if (now - edgeStateRef.current.enteredAt < PAGINATION_EDGE_DWELL_MS) return;
    if (now - lastSwitchAtRef.current < PAGINATION_SWITCH_COOLDOWN) return;

    const nextPage = getPageAfterDragEdge({ edge, currentPage, totalPages });
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
      lastSwitchAtRef.current = now;
    }
  };

  return {
    handleDragStart: (event) => {
      reset();
      return getClientYFromEvent(event.activatorEvent as Event);
    },
    handleDragMove: (event, dragStartClientY) => {
      if (dragStartClientY === null) return;
      updatePageByDragY(dragStartClientY + event.delta.y, !!event.over);
    },
    resolveActiveLink: (event, links) => links.find((item) => item.id === event.active.id) || null,
    reset,
  };
};
