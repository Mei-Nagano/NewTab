import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Link, LinkDisplayMode, LinkGroup, Theme } from '../../../constants';
import { SiteIcon } from '../../common/SiteIcon';

interface LinkGridProps {
  groups: LinkGroup[];
  theme: Theme;
  isEditMode?: boolean;
  linkDisplayMode?: LinkDisplayMode;
  onReorderLinks?: (groupId: string, activeId: string, overId: string, overGroupId?: string) => void;
  onLinkContextMenu?: (e: React.MouseEvent, link: Link, groupId: string) => void;
  onToggleCollapse?: (groupId: string) => void;
  onGroupContextMenu?: (e: React.MouseEvent, groupId: string) => void;
  forceHideGroupNames?: boolean;
  onDeleteLink?: (link: Link, groupId: string) => void;
}

interface LinkWithGroup extends Link {
  groupId: string;
}

const ALL_GROUP_ID = '__all__';
const PAGINATION_EDGE_TRIGGER_SIZE = 72;
const PAGINATION_SWITCH_COOLDOWN = 450;
const PAGINATION_EDGE_DWELL_MS = 300;

const SortableLinkItem: React.FC<{
  link: Link;
  theme: Theme;
  isEditMode: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDelete?: () => void;
}> = ({ link, theme, isEditMode, onContextMenu, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLight = theme === 'light';
  const iconBgClass = isLight ? 'bg-white/80 shadow-sm border border-white/50' : 'bg-white/10 shadow-inner';
  const textClass = isLight ? 'text-slate-600 font-medium group-hover:text-slate-900' : 'text-white/60 group-hover:text-white';
  const cardClass = isLight
    ? 'bg-white/40 hover:bg-white/80 border-white/60 hover:border-white shadow-sm hover:shadow-lg hover:shadow-blue-500/5 backdrop-blur-sm'
    : 'bg-white/5 hover:bg-white/15 border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-black/10';

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e);
  };

  return (
    <div className="relative group/item">
      <a
        ref={setNodeRef}
        style={style}
        href={isEditMode ? undefined : link.url}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
        className={`group flex flex-col items-center justify-center p-4 rounded-2xl border ${isEditMode ? 'transition-colors' : 'transition-all hover:-translate-y-1'} duration-300 ${cardClass} ${isDragging ? 'opacity-50 scale-105 shadow-2xl z-50' : ''} ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center overflow-hidden transition-all group-hover:shadow-md ${iconBgClass}`}>
          <SiteIcon
            url={link.url}
            title={link.title}
            linkId={link.id}
            customIcon={link.icon}
          />
        </div>
        <span className={`text-xs font-medium truncate w-full text-center transition-colors ${textClass}`}>
          {link.title}
        </span>
      </a>

      {isEditMode && !isDragging && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className={`absolute -top-2 -right-2 z-20 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 ${isLight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500/80 text-white hover:bg-red-500'}`}
          title="Delete link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

const LinkItemOverlay: React.FC<{ link: Link; theme: Theme }> = ({ link, theme }) => {
  const isLight = theme === 'light';
  const iconBgClass = isLight ? 'bg-white/90 shadow-sm border border-white/50' : 'bg-white/10 shadow-inner';
  const textClass = isLight ? 'text-slate-700 font-bold' : 'text-white/60';
  const cardClass = isLight
    ? 'bg-white/90 border-white shadow-2xl shadow-blue-500/10 scale-105'
    : 'bg-white/15 border-white/20 shadow-2xl shadow-black/20';

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${cardClass} scale-105`}>
      <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center overflow-hidden ${iconBgClass}`}>
        <SiteIcon url={link.url} title={link.title} linkId={link.id} customIcon={link.icon} />
      </div>
      <span className={`text-xs font-medium truncate w-full text-center ${textClass}`}>
        {link.title}
      </span>
    </div>
  );
};

export const LinkGrid: React.FC<LinkGridProps> = ({
  groups,
  theme,
  isEditMode = false,
  linkDisplayMode = 'scroll',
  onReorderLinks,
  onLinkContextMenu,
  onGroupContextMenu,
  forceHideGroupNames = false,
  onDeleteLink,
}) => {
  const [activeLink, setActiveLink] = useState<{ link: Link; groupId: string } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(ALL_GROUP_ID);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [isPaginationExpanded, setIsPaginationExpanded] = useState(true);

  const paginationContainerRef = useRef<HTMLDivElement | null>(null);
  const dragStartClientYRef = useRef<number | null>(null);
  const lastAutoPageSwitchAtRef = useRef(0);
  const edgeHoverStateRef = useRef<{ edge: 'top' | 'bottom' | null; enteredAt: number }>({
    edge: null,
    enteredAt: 0,
  });
  const wheelDeltaRef = useRef(0);
  const collapseTimerRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const isLight = theme === 'light';
  const isPagination = linkDisplayMode === 'pagination';

  useEffect(() => {
    if (!isPagination) return;

    const calculateLayout = () => {
      const vh = window.innerHeight;
      const cols = 8;

      const overhead = 420;
      const availableHeight = vh - overhead;
      const itemHeight = 130;

      const rows = Math.max(1, Math.floor(availableHeight / itemHeight));
      setItemsPerPage(rows * cols);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [isPagination]);

  const filteredGroups = groups.filter(group => group.links.length > 0);
  const selectedGroups = selectedGroupId === ALL_GROUP_ID
    ? filteredGroups
    : filteredGroups.filter(group => group.id === selectedGroupId);
  const selectedLinks: LinkWithGroup[] = selectedGroups.flatMap(group =>
    group.links.map(link => ({ ...link, groupId: group.id }))
  );
  const linkGroupIdById = new Map(selectedLinks.map(link => [link.id, link.groupId]));
  const totalPages = Math.ceil(selectedLinks.length / itemsPerPage);
  const totalLinkCount = filteredGroups.reduce((total, group) => total + group.links.length, 0);

  useEffect(() => {
    if (selectedGroupId === ALL_GROUP_ID) return;
    if (!filteredGroups.some(group => group.id === selectedGroupId)) {
      setSelectedGroupId(ALL_GROUP_ID);
    }
  }, [filteredGroups, selectedGroupId]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedGroupId]);

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const schedulePaginationCollapse = () => {
    clearCollapseTimer();
    collapseTimerRef.current = window.setTimeout(() => {
      setIsPaginationExpanded(false);
    }, 3000);
  };

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [selectedLinks.length, totalPages, currentPage]);

  useEffect(() => {
    if (!isPagination || totalPages <= 1) {
      clearCollapseTimer();
      setIsPaginationExpanded(true);
      return;
    }

    setIsPaginationExpanded(true);
    schedulePaginationCollapse();

    return () => {
      clearCollapseTimer();
    };
  }, [isPagination, totalPages]);

  if (!filteredGroups || filteredGroups.length === 0) {
    return (
      <div className={`text-sm italic py-10 ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
        No links yet. Click settings to add some.
      </div>
    );
  }

  const paginatedLinks = isPagination
    ? selectedLinks.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : selectedLinks;

  const getClientYFromEvent = (event: Event | null): number | null => {
    if (!event) return null;

    if (typeof MouseEvent !== 'undefined' && event instanceof MouseEvent) {
      return event.clientY;
    }

    return null;
  };

  const updatePaginationByDragY = (clientY: number) => {
    if (!isPagination || !isEditMode || totalPages <= 1 || !activeLink) {
      edgeHoverStateRef.current = { edge: null, enteredAt: 0 };
      return;
    }

    const container = paginationContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const triggerSize = Math.min(PAGINATION_EDGE_TRIGGER_SIZE, Math.max(36, Math.floor(rect.height * 0.14)));

    let nextEdge: 'top' | 'bottom' | null = null;
    if (clientY <= rect.top + triggerSize) {
      nextEdge = 'top';
    } else if (clientY >= rect.bottom - triggerSize) {
      nextEdge = 'bottom';
    }

    if (!nextEdge) {
      edgeHoverStateRef.current = { edge: null, enteredAt: 0 };
      return;
    }

    const now = Date.now();
    if (edgeHoverStateRef.current.edge !== nextEdge) {
      edgeHoverStateRef.current = { edge: nextEdge, enteredAt: now };
      return;
    }

    if (now - edgeHoverStateRef.current.enteredAt < PAGINATION_EDGE_DWELL_MS) {
      return;
    }

    if (now - lastAutoPageSwitchAtRef.current < PAGINATION_SWITCH_COOLDOWN) {
      return;
    }

    if (nextEdge === 'top' && currentPage > 0) {
      setCurrentPage(p => Math.max(0, p - 1));
      lastAutoPageSwitchAtRef.current = now;
      return;
    }

    if (nextEdge === 'bottom' && currentPage < totalPages - 1) {
      setCurrentPage(p => Math.min(totalPages - 1, p + 1));
      lastAutoPageSwitchAtRef.current = now;
    }
  };

  const handleDragStart = (event: DragStartEvent, links: LinkWithGroup[]) => {
    const link = links.find(item => item.id === event.active.id);
    if (link) {
      setActiveLink({ link, groupId: link.groupId });
    }

    dragStartClientYRef.current = getClientYFromEvent(event.activatorEvent as Event);
    lastAutoPageSwitchAtRef.current = 0;
    edgeHoverStateRef.current = { edge: null, enteredAt: 0 };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveLink(null);
    dragStartClientYRef.current = null;
    edgeHoverStateRef.current = { edge: null, enteredAt: 0 };

    if (!activeLink || !over || active.id === over.id || !onReorderLinks) return;

    const overId = over.id as string;
    onReorderLinks(activeLink.groupId, active.id as string, overId, linkGroupIdById.get(overId));
  };

  const handleDragCancel = () => {
    setActiveLink(null);
    dragStartClientYRef.current = null;
    edgeHoverStateRef.current = { edge: null, enteredAt: 0 };
  };

  const handlePaginationDragMove = (event: DragMoveEvent) => {
    if (!isPagination || !isEditMode || !activeLink) return;

    const startY = dragStartClientYRef.current;
    if (startY === null) return;

    updatePaginationByDragY(startY + event.delta.y);
  };

  const handlePaginationWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isPagination || totalPages <= 1) return;

    e.preventDefault();
    wheelDeltaRef.current += e.deltaY;

    const threshold = 40;
    if (wheelDeltaRef.current >= threshold) {
      setCurrentPage(p => Math.min(totalPages - 1, p + 1));
      wheelDeltaRef.current = 0;
    } else if (wheelDeltaRef.current <= -threshold) {
      setCurrentPage(p => Math.max(0, p - 1));
      wheelDeltaRef.current = 0;
    }
  };

  const handlePaginationMouseEnter = () => {
    clearCollapseTimer();
    setIsPaginationExpanded(true);
  };

  const handlePaginationMouseLeave = () => {
    clearCollapseTimer();
    setIsPaginationExpanded(false);
  };

  const renderPaginationControls = (className?: string) => {
    if (!isPagination || totalPages <= 1) return null;

    return (
      <div
        onMouseEnter={handlePaginationMouseEnter}
        onMouseLeave={handlePaginationMouseLeave}
        className={`flex flex-col items-center animate-fade-in transition-all duration-300 ${className ?? ''} ${isLight
          ? 'bg-white/35 border-white/50'
          : 'bg-black/20 border-white/10'
          } backdrop-blur-md border rounded-2xl ${isPaginationExpanded ? 'gap-4 px-2.5 py-3' : 'gap-2 px-2 py-2.5'}`}
      >
        <button
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className={`${isPaginationExpanded ? 'p-2.5 rounded-full' : 'hidden'} transition-all duration-300 ${isLight
            ? 'bg-white/40 border-white text-slate-600 hover:bg-white/80 disabled:opacity-30'
            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/15 disabled:opacity-20'
            } border disabled:cursor-not-allowed active:scale-90`}
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>

        <div className={`${isPaginationExpanded ? 'flex' : 'hidden'} flex-col items-center gap-2.5 max-h-[42vh] overflow-y-auto py-1`}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`h-2 rounded-full transition-all duration-500 ${currentPage === i
                ? (isLight ? 'bg-indigo-500 h-7 w-2.5' : 'bg-indigo-400 h-7 w-2.5')
                : (isLight ? 'bg-slate-300 h-2 w-2 hover:bg-slate-400' : 'bg-white/20 h-2 w-2 hover:bg-white/40')
                }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

        {!isPaginationExpanded && (
          <div
            className="flex flex-col items-center justify-center gap-1.5 py-1 px-0.5 transition-all duration-300"
            aria-label={`Page ${currentPage + 1} of ${totalPages}`}
          >
            <span className={`text-[12px] font-black leading-none ${isLight ? 'text-slate-700' : 'text-white/90'}`}>
              {currentPage + 1}
            </span>
            <div className={`w-3 h-[2px] rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
            <span className={`text-[10px] font-bold leading-none ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
              {totalPages}
            </span>
          </div>
        )}

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage === totalPages - 1}
          className={`${isPaginationExpanded ? 'p-2.5 rounded-full' : 'hidden'} transition-all duration-300 ${isLight
            ? 'bg-white/40 border-white text-slate-600 hover:bg-white/80 disabled:opacity-30'
            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/15 disabled:opacity-20'
            } border disabled:cursor-not-allowed active:scale-90`}
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>
    );
  };

  const renderDesktopGroupControls = (className?: string) => {
    if (forceHideGroupNames) return null;

    return (
      <div
        className={`flex flex-col items-stretch gap-2 p-2 max-h-[48vh] overflow-y-auto animate-fade-in transition-all duration-300 ${className ?? ''} ${isLight
          ? 'bg-white/35 border-white/50'
          : 'bg-black/20 border-white/10'
          } backdrop-blur-md border rounded-2xl`}
      >
        <button
          onClick={() => setSelectedGroupId(ALL_GROUP_ID)}
          className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold tracking-wide transition-all ${selectedGroupId === ALL_GROUP_ID
            ? (isLight
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'bg-indigo-500/35 border-indigo-400/60 text-white')
            : (isLight
              ? 'bg-white/55 border-white text-slate-600 hover:bg-white/80'
              : 'bg-white/5 border-white/10 text-white/65 hover:bg-white/10')
            }`}
          title="All links (default group)"
        >
          <span className="truncate">All links</span>
          <span className={`${selectedGroupId === ALL_GROUP_ID ? 'text-white/90' : (isLight ? 'text-slate-500' : 'text-white/35')}`}>({totalLinkCount})</span>
        </button>

        {filteredGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            onContextMenu={(e) => onGroupContextMenu?.(e, group.id)}
            className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold tracking-wide transition-all ${selectedGroupId === group.id
              ? (isLight
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'bg-indigo-500/35 border-indigo-400/60 text-white')
              : (isLight
                ? 'bg-white/55 border-white text-slate-600 hover:bg-white/80'
                : 'bg-white/5 border-white/10 text-white/65 hover:bg-white/10')
              }`}
            title={group.title}
          >
            <span className="truncate">{group.title}</span>
            <span className={`${selectedGroupId === group.id ? 'text-white/90' : (isLight ? 'text-slate-500' : 'text-white/35')}`}>({group.links.length})</span>
          </button>
        ))}
      </div>
    );
  };


  return (
    <div className={`w-full max-w-5xl flex flex-col gap-8 ${isPagination ? 'pb-4' : 'pb-10'}`}>
      {isPagination ? (
        <div
          ref={paginationContainerRef}
          onWheel={handlePaginationWheel}
          className="w-full relative"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => handleDragStart(e, paginatedLinks)}
            onDragMove={handlePaginationDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={paginatedLinks.map(l => l.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-8 gap-4 min-h-[100px]">
                {paginatedLinks.map((link) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    theme={theme}
                    isEditMode={isEditMode}
                    onContextMenu={(e) => onLinkContextMenu?.(e, link, link.groupId)}
                    onDelete={() => onDeleteLink?.(link, link.groupId)}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeLink && (
                <LinkItemOverlay link={activeLink.link} theme={theme} />
              )}
            </DragOverlay>
          </DndContext>



          {renderDesktopGroupControls('absolute right-full mr-4 top-1/2 -translate-y-1/2 z-20')}
          {renderPaginationControls('absolute left-full ml-4 top-1/2 -translate-y-1/2 z-20')}
        </div>
      ) : (
        <div className="w-full relative animate-slide-up">
          {renderDesktopGroupControls('absolute right-full mr-4 top-1/2 -translate-y-1/2 z-20')}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => handleDragStart(e, selectedLinks)}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={selectedLinks.map(link => link.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-8 gap-4">
                {selectedLinks.map((link) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    theme={theme}
                    isEditMode={isEditMode}
                    onContextMenu={(e) => onLinkContextMenu?.(e, link, link.groupId)}
                    onDelete={() => onDeleteLink?.(link, link.groupId)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeLink && (
                <LinkItemOverlay link={activeLink.link} theme={theme} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
};
