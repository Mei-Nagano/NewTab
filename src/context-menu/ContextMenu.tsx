import { useMemo, useRef } from 'react';
import { ContextMenuItem } from './components/ContextMenuItem';
import { ContextMenuSeparator } from './components/ContextMenuSeparator';
import { SubMenu } from './components/SubMenu';
import type { ContextMenuProps, MenuItem } from './types';
import { useMenuPosition } from './hooks/useMenuPosition';
import { buildBlankMenu } from './builders/buildBlankMenu';
import { buildGroupMenu } from './builders/buildGroupMenu';
import { buildLinkMenu } from './builders/buildLinkMenu';
import { useContextMenuLifecycle } from './hooks/useContextMenuLifecycle';

const toMenuItems = (props: ContextMenuProps, isLight: boolean): MenuItem[] => {
  if (props.state.type === 'blank') {
    return buildBlankMenu({
      isLight,
      isEditMode: props.isEditMode,
      isPaginationMode: props.isPaginationMode,
      hideOptions: props.hideOptions,
      onToggleTheme: props.onToggleTheme,
      onSaveWallpaper: props.onSaveWallpaper,
      onToggleEditMode: props.onToggleEditMode,
      onOpenSettings: props.onOpenSettings,
      onToggleHideOption: props.onToggleHideOption,
      onToggleAllVisibility: props.onToggleAllVisibility,
    });
  }

  if (props.state.type === 'group') {
    return buildGroupMenu({
      targetGroupId: props.state.targetGroupId,
      onEditGroup: props.onEditGroup,
    });
  }

  return buildLinkMenu({
    targetLink: props.state.targetLink,
    targetGroupId: props.state.targetGroupId,
    onEditLink: props.onEditLink,
    onDeleteLink: props.onDeleteLink,
  });
};

export const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const position = useMenuPosition(menuRef, props.state.visible, props.state.x, props.state.y);
  const isLight = props.theme === 'light';
  const menuClass = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
    : 'bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10';

  useContextMenuLifecycle({
    visible: props.state.visible,
    menuRef,
    onClose: props.onClose,
  });

  const menuItems = useMemo(() => toMenuItems(props, isLight), [props, isLight]);
  if (!props.state.visible) return null;

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: position.x, top: position.y, zIndex: 9999 }}
      className={`min-w-[220px] rounded-2xl p-1.5 flex flex-col animate-context-menu ${menuClass}`}
      role="menu"
      aria-label="Context menu"
    >
      {menuItems.map((item) => {
        if (item.type === 'separator') {
          return <ContextMenuSeparator key={item.id} isLight={isLight} />;
        }

        if (item.children) {
          return (
            <SubMenu
              key={item.id}
              item={item}
              isLight={isLight}
              onClose={props.onClose}
              menuClass={menuClass}
            />
          );
        }

        return (
          <ContextMenuItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isLight={isLight}
            className={item.className}
            onClick={() => {
              item.onClick?.();
              props.onClose();
            }}
          />
        );
      })}
    </div>
  );
};
