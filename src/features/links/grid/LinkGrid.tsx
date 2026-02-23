import { useMemo, useRef, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { ALL_GROUP_ID } from './constants';
import { GroupSidebar } from './GroupSidebar';
import { LinkCard } from './LinkCard';
import { LinkDragOverlay } from './LinkDragOverlay';
import { PaginationSidebar } from './PaginationSidebar';
import { useDragAutoPage } from './hooks/useDragAutoPage';
import { useGridPagination } from './hooks/useGridPagination';
import { useWheelPageSwitch } from './hooks/useWheelPageSwitch';
import type { LinkGridProps, LinkWithGroup } from './types';

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
  const [selectedGroupId, setSelectedGroupId] = useState<string>(ALL_GROUP_ID);
  const [activeLink, setActiveLink] = useState<LinkWithGroup | null>(null);
  const paginationContainerRef = useRef<HTMLDivElement | null>(null);
  const dragStartClientYRef = useRef<number | null>(null);
  const isPagination = linkDisplayMode === 'pagination';

  const filteredGroups = useMemo(() => groups.filter((group) => group.links.length > 0), [groups]);
  const selectedGroups = selectedGroupId === ALL_GROUP_ID ? filteredGroups : filteredGroups.filter((group) => group.id === selectedGroupId);
  const selectedLinks = useMemo<LinkWithGroup[]>(
    () => selectedGroups.flatMap((group) => group.links.map((link) => ({ ...link, groupId: group.id }))),
    [selectedGroups]
  );
  const groupByLinkId = useMemo(() => new Map(selectedLinks.map((link) => [link.id, link.groupId])), [selectedLinks]);
  const totalLinkCount = useMemo(() => filteredGroups.reduce((sum, group) => sum + group.links.length, 0), [filteredGroups]);

  const pagination = useGridPagination({
    isPagination,
    totalItems: selectedLinks.length,
    resetKey: selectedGroupId,
  });
  const paginatedLinks = pagination.paginate(selectedLinks);
  const wheelPageSwitch = useWheelPageSwitch({
    isPagination,
    totalPages: pagination.totalPages,
    setCurrentPage: pagination.setCurrentPage,
  });
  const dragAutoPage = useDragAutoPage({
    isPagination,
    isEditMode,
    totalPages: pagination.totalPages,
    currentPage: pagination.currentPage,
    hasActiveLink: !!activeLink,
    containerRef: paginationContainerRef,
    setCurrentPage: pagination.setCurrentPage,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  if (filteredGroups.length === 0) return <div className={`text-sm italic py-10 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>暂无链接，请在设置中添加。</div>;

  const handleDragStart = (event: DragStartEvent, links: LinkWithGroup[]) => {
    const resolved = dragAutoPage.resolveActiveLink(event, links);
    setActiveLink(resolved);
    dragStartClientYRef.current = dragAutoPage.handleDragStart(event);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    dragAutoPage.handleDragMove(event, dragStartClientYRef.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!activeLink || !over || active.id === over.id || !onReorderLinks) {
      setActiveLink(null);
      dragAutoPage.reset();
      return;
    }
    const overId = String(over.id);
    onReorderLinks({
      sourceGroupId: activeLink.groupId,
      activeId: String(active.id),
      overId,
      targetGroupId: groupByLinkId.get(overId),
    });
    setActiveLink(null);
    dragAutoPage.reset();
  };

  const linkItems = isPagination ? paginatedLinks : selectedLinks;
  return (
    <div className={`w-full max-w-5xl flex flex-col gap-8 ${isPagination ? 'pb-4' : 'pb-10'}`}>
      <div ref={paginationContainerRef} onWheel={wheelPageSwitch} className="w-full relative">
        {!forceHideGroupNames && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 z-20">
            <GroupSidebar groups={filteredGroups} selectedGroupId={selectedGroupId} totalLinkCount={totalLinkCount} theme={theme} onSelectGroup={setSelectedGroupId} onGroupContextMenu={onGroupContextMenu} />
          </div>
        )}
        {isPagination && (
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-20">
            <PaginationSidebar theme={theme} currentPage={pagination.currentPage} totalPages={pagination.totalPages} isExpanded={pagination.isExpanded} onPageChange={pagination.setCurrentPage} onPrev={() => pagination.setCurrentPage((prev) => Math.max(0, prev - 1))} onNext={() => pagination.setCurrentPage((prev) => Math.min(pagination.totalPages - 1, prev + 1))} onMouseEnter={pagination.onMouseEnter} onMouseLeave={pagination.onMouseLeave} />
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(event) => handleDragStart(event, linkItems)} onDragMove={handleDragMove} onDragEnd={handleDragEnd} onDragCancel={() => setActiveLink(null)}>
          <SortableContext items={linkItems.map((link) => link.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-8 gap-4 min-h-[100px]">
              {linkItems.map((link) => (
                <LinkCard key={link.id} link={link} theme={theme} isEditMode={isEditMode} onContextMenu={(event) => onLinkContextMenu?.(event, link, link.groupId)} onDelete={() => onDeleteLink?.(link, link.groupId)} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>{activeLink && <LinkDragOverlay link={activeLink} theme={theme} />}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
