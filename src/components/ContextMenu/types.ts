import React from 'react';
import type { Theme, Link, HideOptions } from '../../types';

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    type: 'blank' | 'link' | 'group';
    targetLink?: Link;
    targetGroupId?: string;
}

export interface ContextMenuProps {
    state: ContextMenuState;
    theme: Theme;
    isEditMode: boolean;
    hideOptions?: HideOptions;
    onClose: () => void;
    onToggleTheme: () => void;
    onToggleEditMode: () => void;
    onEditLink: (link: Link, groupId: string) => void;
    onEditGroup?: (groupId: string) => void;
    onToggleHideOption?: (option: keyof HideOptions) => void;
    onDeleteLink?: (link: Link, groupId: string) => void;
    onOpenSettings?: () => void;
    onToggleAllVisibility?: () => void;
    onSaveWallpaper?: () => void;
}

export interface MenuItem {
    id: string;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    children?: MenuItem[];
    show?: boolean;
    checked?: boolean;
    type?: 'item' | 'separator';
}
