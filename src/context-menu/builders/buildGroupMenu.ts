import type { MenuItem } from '@/context-menu/types';
import type { GroupMenuBuilderContext } from './types';

export const buildGroupMenu = ({
  targetGroupId,
  onEditGroup,
}: GroupMenuBuilderContext): MenuItem[] => {
  if (!targetGroupId) return [];

  return [
    {
      id: 'edit-group',
      label: '修改分组名',
      onClick: () => onEditGroup?.(targetGroupId),
    },
  ];
};
