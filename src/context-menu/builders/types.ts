import type { HideOptions } from '@/types';
import type { ContextMenuProps, MenuItem } from '@/context-menu/types';

export interface BlankMenuBuilderContext {
  isLight: boolean;
  isEditMode: boolean;
  isPaginationMode?: boolean;
  hideOptions?: HideOptions;
  onToggleTheme: ContextMenuProps['onToggleTheme'];
  onSaveWallpaper?: ContextMenuProps['onSaveWallpaper'];
  onToggleEditMode: ContextMenuProps['onToggleEditMode'];
  onOpenSettings?: ContextMenuProps['onOpenSettings'];
  onToggleHideOption?: ContextMenuProps['onToggleHideOption'];
  onToggleAllVisibility?: ContextMenuProps['onToggleAllVisibility'];
}

export interface LinkMenuBuilderContext {
  targetLink?: ContextMenuProps['state']['targetLink'];
  targetGroupId?: string;
  onEditLink: ContextMenuProps['onEditLink'];
  onDeleteLink?: ContextMenuProps['onDeleteLink'];
}

export interface GroupMenuBuilderContext {
  targetGroupId?: string;
  onEditGroup?: ContextMenuProps['onEditGroup'];
}

export type MenuBuilder = () => MenuItem[];
