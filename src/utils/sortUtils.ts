import { arrayMove } from '@dnd-kit/sortable';
import type { LinkGroup } from '../constants';

/**
 * 重新排序数组中的项目
 * @param items 原始数组
 * @param activeId 被拖拽项目的ID
 * @param overId 目标位置项目的ID
 * @returns 重新排序后的数组
 */
export function reorderItems<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string
): T[] {
  const oldIndex = items.findIndex(item => item.id === activeId);
  const newIndex = items.findIndex(item => item.id === overId);

  if (oldIndex === -1 || newIndex === -1) {
    return items;
  }

  return arrayMove(items, oldIndex, newIndex);
}

/**
 * 重新排序分组中的链接
 */
export function reorderLinksInGroup(
  groups: LinkGroup[],
  groupId: string,
  activeId: string,
  overId: string
): LinkGroup[] {
  return groups.map(group => {
    if (group.id !== groupId) return group;

    return {
      ...group,
      links: reorderItems(group.links, activeId, overId)
    };
  });
}

/**
 * 重新排序分组
 */
export function reorderGroups(
  groups: LinkGroup[],
  activeId: string,
  overId: string
): LinkGroup[] {
  return reorderItems(groups, activeId, overId);
}
