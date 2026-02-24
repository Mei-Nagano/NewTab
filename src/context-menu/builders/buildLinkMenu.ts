import type { MenuItem } from '@/context-menu/types';
import type { LinkMenuBuilderContext } from './types';

export const buildLinkMenu = ({
  targetLink,
  targetGroupId,
  onEditLink,
  onDeleteLink,
}: LinkMenuBuilderContext): MenuItem[] => {
  if (!targetLink || !targetGroupId) return [];

  return [
    {
      id: 'edit-link',
      label: '编辑网站',
      onClick: () => onEditLink(targetLink, targetGroupId),
    },
    {
      id: 'delete-link',
      label: '删除网站',
      className: 'text-red-500 hover:text-red-400',
      onClick: () => onDeleteLink?.(targetLink, targetGroupId),
    },
  ];
};
