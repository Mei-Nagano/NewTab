import type { Link, LinkDisplayMode, LinkGroup, Theme } from '@/constants';

export interface LinkWithGroup extends Link {
  groupId: string;
}

export interface ReorderPayload {
  sourceGroupId: string;
  activeId: string;
  overId: string;
  targetGroupId?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface LinkGridProps {
  groups: LinkGroup[];
  theme: Theme;
  isEditMode?: boolean;
  linkDisplayMode?: LinkDisplayMode;
  onReorderLinks?: (payload: ReorderPayload) => void;
  onLinkContextMenu?: (event: React.MouseEvent, link: Link, groupId: string) => void;
  onToggleCollapse?: (groupId: string) => void;
  onGroupContextMenu?: (event: React.MouseEvent, groupId: string) => void;
  forceHideGroupNames?: boolean;
  onDeleteLink?: (link: Link, groupId: string) => void;
}
