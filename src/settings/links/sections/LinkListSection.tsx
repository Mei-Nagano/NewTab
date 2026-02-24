import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableLinkItem } from '@/settings/links/components/SortableLinkItem';
import { reorderItems } from '@/shared/utils';
import type { Link } from '@/types';
import { SettingSection } from '../../components/SettingSection';

interface LinkListSectionProps {
  theme: 'light' | 'dark';
  links: Link[];
  selectedLinkIds: Set<string>;
  editingLinkId: string | null;
  isAllGroupSelected: boolean;
  onReorder: (links: Link[]) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onStartEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: () => void;
}

export const LinkListSection: React.FC<LinkListSectionProps> = ({
  theme,
  links,
  selectedLinkIds,
  editingLinkId,
  isAllGroupSelected,
  onReorder,
  onToggleSelect,
  onToggleSelectAll,
  onStartEdit,
  onDelete,
  onDeleteSelected,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const isLight = theme === 'light';

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isAllGroupSelected) return;
    onReorder(reorderItems(links, String(active.id), String(over.id)));
  };

  return (
    <SettingSection
      title="链接列表"
      theme={theme}
      accentColor="bg-emerald-500"
      headerAction={links.length > 0 && !isAllGroupSelected && (
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSelectAll}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isLight ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
          >
            {selectedLinkIds.size === links.length ? '取消全选' : '选择全部'}
          </button>
          {selectedLinkIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[11px] font-bold border border-red-500/20 transition-all"
            >
              删除选中 ({selectedLinkIds.size})
            </button>
          )}
        </div>
      )}
    >
      <div className="flex items-center gap-2 -mt-2 mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'}`}>
          共 {links.length} 个链接
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((link) => link.id)} strategy={rectSortingStrategy}>
          {links.length === 0 ? (
            <div className={`text-center py-12 rounded-3xl border border-dashed transition-all ${isLight ? 'border-gray-200 bg-gray-50/30 text-gray-400' : 'border-white/10 bg-white/5 text-gray-500'}`}>
              当前分组暂无链接
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {links.map((link) => (
                <SortableLinkItem key={link.id} link={link} isEditing={editingLinkId === link.id} isSelected={selectedLinkIds.has(link.id)} onSelect={() => onToggleSelect(link.id)} onEdit={() => onStartEdit(link)} onDelete={() => onDelete(link.id)} theme={theme} />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </SettingSection>
  );
};
