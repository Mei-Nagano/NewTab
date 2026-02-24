import { arrayMove } from '@dnd-kit/sortable';
import type { Link, LinkGroup } from '@/types';

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
 * Move a link across groups to the position of the target link.
 */
export function reorderLinksAcrossGroups(
  groups: LinkGroup[],
  activeId: string,
  overId: string
): LinkGroup[] {
  if (activeId === overId) {
    return groups;
  }

  let sourceGroupIndex = -1;
  let sourceLinkIndex = -1;
  let targetGroupIndex = -1;
  let targetLinkIndex = -1;

  groups.forEach((group, groupIndex) => {
    const activeIndex = group.links.findIndex(link => link.id === activeId);
    if (activeIndex !== -1) {
      sourceGroupIndex = groupIndex;
      sourceLinkIndex = activeIndex;
    }

    const overIndex = group.links.findIndex(link => link.id === overId);
    if (overIndex !== -1) {
      targetGroupIndex = groupIndex;
      targetLinkIndex = overIndex;
    }
  });

  if (sourceGroupIndex === -1 || sourceLinkIndex === -1 || targetGroupIndex === -1 || targetLinkIndex === -1) {
    return groups;
  }

  if (sourceGroupIndex === targetGroupIndex) {
    return groups.map((group, index) => {
      if (index !== sourceGroupIndex) return group;

      return {
        ...group,
        links: reorderItems(group.links, activeId, overId),
      };
    });
  }

  const nextGroups = groups.map(group => ({
    ...group,
    links: [...group.links],
  }));

  const [movedLink] = nextGroups[sourceGroupIndex].links.splice(sourceLinkIndex, 1) as Link[];
  if (!movedLink) {
    return groups;
  }

  nextGroups[targetGroupIndex].links.splice(targetLinkIndex, 0, movedLink);
  return nextGroups;
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
