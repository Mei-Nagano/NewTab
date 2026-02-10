import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { LinkGroup, Theme, Link, LinkDisplayMode } from '../../../constants';
import { SiteIcon } from '../../common/SiteIcon';

interface LinkGridProps {
  groups: LinkGroup[];
  theme: Theme;
  isEditMode?: boolean;
  linkDisplayMode?: LinkDisplayMode;
  onReorderLinks?: (groupId: string, activeId: string, overId: string) => void;
  onLinkContextMenu?: (e: React.MouseEvent, link: Link, groupId: string) => void;
  onToggleCollapse?: (groupId: string) => void;
  onGroupContextMenu?: (e: React.MouseEvent, groupId: string) => void;
  forceHideGroupNames?: boolean;
  onDeleteLink?: (link: Link, groupId: string) => void;
}


// 可拖拽的链接组件
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

      {/* 删除按钮 - 仅在编辑模式显示 */}
      {isEditMode && !isDragging && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className={`absolute -top-2 -right-2 z-20 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 ${isLight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500/80 text-white hover:bg-red-500'
            }`}
          title="删除"
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

// 普通链接组件（用于 DragOverlay）
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
  onToggleCollapse,
  onGroupContextMenu,
  forceHideGroupNames = false,
  onDeleteLink,
}) => {
  const [activeLink, setActiveLink] = useState<{ link: Link; groupId: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(24); // 默认值

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const isLight = theme === 'light';
  const isPagination = linkDisplayMode === 'pagination';

  // 计算每页显示数量
  useEffect(() => {
    if (!isPagination) return;

    const calculateLayout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // 计算列数 (和 Tailwind 的 grid-cols 一致)
      let cols = 4;
      if (vw >= 1280) cols = 8;
      else if (vw >= 1024) cols = 6;
      else if (vw >= 768) cols = 5;

      // 估算头部占比 (Clock + Search + Padding + Pagination Controls)
      const overhead = 420; // Increased overhead safety
      const availableHeight = vh - overhead;
      const itemHeight = 130; // Increased item height safety

      const rows = Math.max(1, Math.floor(availableHeight / itemHeight));
      setItemsPerPage(rows * cols);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [isPagination]);

  // 当页码超出总页数时重置 (例如删除链接后)
  const filteredGroups = groups.filter(group => group.links.length > 0);
  const allLinks = filteredGroups.flatMap(g => g.links.map(l => ({ ...l, groupId: g.id })));
  const totalPages = Math.ceil(allLinks.length / itemsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [allLinks.length, totalPages, currentPage]);

  if (!filteredGroups || filteredGroups.length === 0) {
    return (
      <div className={`text-sm italic py-10 ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
        No links yet. Click settings to add some.
      </div>
    );
  }

  // 分页数据切片
  const paginatedLinks = isPagination
    ? allLinks.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : [];

  const handleDragStart = (event: DragStartEvent, groupId: string, links: Link[]) => {
    const link = links.find(l => l.id === event.active.id);
    if (link) setActiveLink({ link, groupId });
  };

  const handleDragEnd = (event: DragEndEvent, groupId: string) => {
    const { active, over } = event;
    setActiveLink(null);
    if (over && active.id !== over.id && onReorderLinks) {
      onReorderLinks(groupId, active.id as string, over.id as string);
    }
  };

  const renderPaginationControls = () => {
    if (!isPagination || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-6 mt-8 animate-fade-in">
        <button
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className={`p-2.5 rounded-full transition-all duration-300 ${isLight
            ? 'bg-white/40 border-white text-slate-600 hover:bg-white/80 disabled:opacity-30'
            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/15 disabled:opacity-20'
            } border disabled:cursor-not-allowed active:scale-90`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div className="flex gap-2.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`h-2 rounded-full transition-all duration-500 ${currentPage === i
                ? (isLight ? 'bg-indigo-500 w-8' : 'bg-indigo-400 w-8')
                : (isLight ? 'bg-slate-300 w-2 hover:bg-slate-400' : 'bg-white/20 w-2 hover:bg-white/40')
                }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage === totalPages - 1}
          className={`p-2.5 rounded-full transition-all duration-300 ${isLight
            ? 'bg-white/40 border-white text-slate-600 hover:bg-white/80 disabled:opacity-30'
            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/15 disabled:opacity-20'
            } border disabled:cursor-not-allowed active:scale-90`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-5xl flex flex-col gap-8 ${isPagination ? 'pb-4' : 'pb-10'}`}>
      {isPagination ? (
        <div className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => {
              const link = paginatedLinks.find(l => l.id === e.active.id);
              if (link) setActiveLink({ link, groupId: link.groupId });
            }}
            onDragEnd={(e) => {
              if (activeLink) handleDragEnd(e, activeLink.groupId);
            }}
          >
            <SortableContext
              items={paginatedLinks.map(l => l.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 min-h-[100px]">
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
          {renderPaginationControls()}
        </div>
      ) : (
        filteredGroups.map((group) => {
          const showTitle = !forceHideGroupNames && group.showTitle !== false;
          const isCollapsed = group.collapsed === true;

          return (
            <div key={group.id} className="w-full animate-slide-up">
              {/* 分组标题 - 美化版 */}
              {showTitle && (
                <div
                  onClick={() => onToggleCollapse?.(group.id)}
                  onContextMenu={(e) => onGroupContextMenu?.(e, group.id)}
                  className={`inline-flex items-center gap-2.5 mb-4 px-4 py-2 rounded-xl cursor-pointer transition-all select-none border ${isLight
                    ? 'bg-white/40 hover:bg-white/60 backdrop-blur-md border-white/40 text-slate-600 hover:text-slate-800'
                    : 'bg-white/5 hover:bg-white/10 backdrop-blur-sm border-white/5 text-white/50 hover:text-white/70'
                    }`}
                >
                  {/* 折叠箭头 */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${isLight ? 'text-slate-400' : 'text-white/30'} ${isCollapsed ? '-rotate-90' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span className={`text-xs font-bold tracking-wide uppercase`}>
                    {group.title}
                  </span>
                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                    ({group.links.length})
                  </span>
                </div>
              )}

              {/* 链接网格 - 折叠时隐藏 */}
              {!isCollapsed && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(e) => handleDragStart(e, group.id, group.links)}
                  onDragEnd={(e) => handleDragEnd(e, group.id)}
                >
                  <SortableContext
                    items={group.links.map(l => l.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {group.links.map((link) => (
                        <SortableLinkItem
                          key={link.id}
                          link={link}
                          theme={theme}
                          isEditMode={isEditMode}
                          onContextMenu={(e) => onLinkContextMenu?.(e, link, group.id)}
                          onDelete={() => onDeleteLink?.(link, group.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <DragOverlay>
                    {activeLink && activeLink.groupId === group.id && (
                      <LinkItemOverlay link={activeLink.link} theme={theme} />
                    )}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};