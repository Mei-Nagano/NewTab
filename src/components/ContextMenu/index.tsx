import React, { useMemo, useRef, useEffect } from 'react';
export * from './types';
import type { ContextMenuProps, MenuItem } from './types'; // Import types
import { useMenuPosition } from './useMenuPosition';
import { ContextMenuItem } from './ContextMenuItem';
import { ContextMenuSeparator } from './ContextMenuSeparator';
import { SubMenu } from './SubMenu';

export const ContextMenu: React.FC<ContextMenuProps> = ({
    state,
    theme,
    isEditMode,
    hideOptions,
    onClose,
    onToggleTheme,
    onToggleEditMode,
    onEditLink,
    onEditGroup,
    onToggleHideOption,
    onDeleteLink,
    onOpenSettings,
    onToggleAllVisibility,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const position = useMenuPosition(menuRef, state.visible, state.x, state.y);
    const isLight = theme === 'light';

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (state.visible) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [state.visible, onClose]);

    // ESC handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (state.visible) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [state.visible, onClose]);

    const menuClass = isLight
        ? 'bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
        : 'bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10';

    const menuItems = useMemo(() => {
        const items: MenuItem[] = [];

        if (state.type === 'blank') {
            items.push({
                id: 'theme',
                label: isLight ? '切换到夜间模式' : '切换到日间模式',
                icon: isLight ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                    </svg>
                ),
                onClick: onToggleTheme,
            });

            items.push({ id: 'sep1', type: 'separator', label: '' });

            items.push({
                id: 'edit-mode',
                label: isEditMode ? '关闭编辑模式' : '开启编辑模式',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                ),
                onClick: onToggleEditMode,
            });

            items.push({ id: 'sep2', type: 'separator', label: '' });

            items.push({
                id: 'settings',
                label: '设置',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                ),
                onClick: onOpenSettings,
            });

            items.push({ id: 'sep3', type: 'separator', label: '' });

            items.push({
                id: 'hide-options',
                label: '隐藏选项',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"></line>
                    </svg>
                ),
                children: [
                    { id: 'hc', label: '隐藏时钟', checked: hideOptions?.hideClock, onClick: () => onToggleHideOption?.('hideClock') },
                    { id: 'hd', label: '隐藏日期', checked: hideOptions?.hideDate, onClick: () => onToggleHideOption?.('hideDate') },
                    { id: 'hal', label: '隐藏所有网页', checked: hideOptions?.hideAllLinks, onClick: () => onToggleHideOption?.('hideAllLinks') },
                    { id: 'hgn', label: '隐藏分组名称', checked: hideOptions?.hideGroupNames, onClick: () => onToggleHideOption?.('hideGroupNames') },
                    { id: 'hsb', label: '隐藏搜索框', checked: hideOptions?.hideSearchBox, onClick: () => onToggleHideOption?.('hideSearchBox') },
                    { id: 'hb', label: '隐藏按钮', checked: hideOptions?.hideButtons, onClick: () => onToggleHideOption?.('hideButtons') },
                    { id: 'sep-all', type: 'separator', label: '' },
                    {
                        id: 'toggle-all',
                        label: '一键隐藏/显示所有',
                        icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
                        onClick: onToggleAllVisibility
                    },
                ]
            });
        } else if (state.type === 'group') {
            items.push({
                id: 'edit-group',
                label: '修改分组名',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                ),
                onClick: () => state.targetGroupId && onEditGroup?.(state.targetGroupId),
            });
        } else if (state.type === 'link') {
            items.push({
                id: 'edit-link',
                label: '编辑网站',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                ),
                onClick: () => state.targetLink && state.targetGroupId && onEditLink(state.targetLink, state.targetGroupId),
            });

            items.push({
                id: 'delete-link',
                label: '删除网站',
                className: 'text-red-500 hover:text-red-400',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ),
                onClick: () => state.targetLink && state.targetGroupId && onDeleteLink?.(state.targetLink, state.targetGroupId),
            });
        }

        return items;
    }, [state, isLight, isEditMode, hideOptions, onToggleTheme, onToggleEditMode, onOpenSettings, onToggleHideOption, onToggleAllVisibility, onEditLink, onEditGroup, onDeleteLink]);

    if (!state.visible) return null;

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 9999,
            }}
            className={`min-w-[220px] rounded-2xl p-1.5 flex flex-col animate-context-menu ${menuClass}`}
            onContextMenu={(e) => e.preventDefault()} // Prevent native context menu on custom menu
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
                            onClose={onClose}
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
                            onClose();
                        }}
                    />
                );
            })}
        </div>
    );
};
