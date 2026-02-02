import React, { useEffect, useRef, useState } from 'react';
import type { Theme, Link, HideOptions } from '../constants';

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    type: 'blank' | 'link' | 'group';
    targetLink?: Link;
    targetGroupId?: string;
}

interface ContextMenuProps {
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
}

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
    const [showHideSubmenu, setShowHideSubmenu] = useState(false);
    const isLight = theme === 'light';

    // 点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
                setShowHideSubmenu(false);
            }
        };

        if (state.visible) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [state.visible, onClose]);

    // 按 ESC 关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showHideSubmenu) {
                    setShowHideSubmenu(false);
                } else {
                    onClose();
                }
            }
        };
        if (state.visible) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [state.visible, showHideSubmenu, onClose]);

    // 重置子菜单状态（当主菜单关闭时）
    useEffect(() => {
        if (!state.visible) {
            setShowHideSubmenu(false);
        }
    }, [state.visible]);

    if (!state.visible) return null;

    // 计算菜单位置，避免超出屏幕
    const menuStyle: React.CSSProperties = {
        position: 'fixed',
        left: state.x,
        top: state.y,
        zIndex: 9999,
    };

    const baseItemClass = `flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors w-full text-left`;
    const itemClass = isLight
        ? `${baseItemClass} text-slate-700 hover:bg-blue-50 hover:text-blue-600`
        : `${baseItemClass} text-gray-200 hover:bg-white/10 hover:text-white`;

    const menuClass = isLight
        ? 'bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl shadow-blue-900/10'
        : 'bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl';

    const hideOpts = hideOptions || {
        hideAllLinks: false,
        hideGroupNames: false,
        hideSearchBox: false,
        hideButtons: false,
        hideDate: false,
        hideClock: false,
    };

    return (
        <div
            ref={menuRef}
            style={menuStyle}
            className={`min-w-[200px] animate-context-menu ${menuClass} ${showHideSubmenu && state.type === 'blank' ? 'rounded-t-xl rounded-bl-xl rounded-br-none' : 'rounded-xl'}`}
        >
            {state.type === 'blank' ? (
                <>
                    {/* 切换主题 */}
                    <button onClick={() => { onToggleTheme(); onClose(); }} className={`${itemClass} rounded-t-xl`}>
                        {isLight ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        )}
                        <span>{isLight ? '切换到夜间模式' : '切换到日间模式'}</span>
                    </button>

                    {/* 分隔线 */}
                    <div className={`h-px mx-1 my-1 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`} />

                    {/* 切换编辑模式 */}
                    <button onClick={() => { onToggleEditMode(); onClose(); }} className={itemClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>{isEditMode ? '关闭编辑模式' : '开启编辑模式'}</span>
                    </button>

                    {/* 分隔线 */}
                    <div className={`h-px mx-1 my-1 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`} />

                    {/* 打开设置 */}
                    <button onClick={() => { onOpenSettings?.(); onClose(); }} className={itemClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>设置</span>
                    </button>

                    {/* 分隔线 */}
                    <div className={`h-px mx-1 my-1 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`} />

                    {/* 隐藏选项 - 带子菜单 */}
                    <div
                        className="relative"
                        onMouseEnter={() => setShowHideSubmenu(true)}
                        onMouseLeave={() => setShowHideSubmenu(false)}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHideSubmenu(!showHideSubmenu);
                            }}
                            className={`${itemClass} justify-between ${showHideSubmenu ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-white') + ' rounded-bl-xl rounded-br-none' : 'rounded-b-xl'}`}
                        >
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"></line>
                                </svg>
                                <span>隐藏选项</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>

                        {/* 子菜单 - 右侧展开 */}
                        {showHideSubmenu && (
                            <div className={`absolute left-full top-0 -ml-[1px] -mt-[1px] min-w-[200px] rounded-r-xl rounded-bl-xl rounded-tl-none overflow-hidden animate-context-menu ${menuClass}`}>
                                <button
                                    onClick={() => onToggleHideOption?.('hideClock')}
                                    className={itemClass}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${hideOpts.hideClock ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                        {hideOpts.hideClock && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span>隐藏时钟</span>
                                </button>

                                <button
                                    onClick={() => onToggleHideOption?.('hideDate')}
                                    className={itemClass}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${hideOpts.hideDate ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                        {hideOpts.hideDate && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span>隐藏日期</span>
                                </button>
                                <button
                                    onClick={() => onToggleHideOption?.('hideAllLinks')}
                                    className={itemClass}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${hideOpts.hideAllLinks ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                        {hideOpts.hideAllLinks && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span>隐藏所有网页</span>
                                </button>

                                <button
                                    onClick={() => onToggleHideOption?.('hideGroupNames')}
                                    className={itemClass}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${hideOpts.hideGroupNames ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                        {hideOpts.hideGroupNames && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span>隐藏分组名称</span>
                                </button>

                                <button
                                    onClick={() => onToggleHideOption?.('hideSearchBox')}
                                    className={itemClass}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${hideOpts.hideSearchBox ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                        {hideOpts.hideSearchBox && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span>隐藏搜索框</span>
                                </button>

                                <button
                                    onClick={() => onToggleHideOption?.('hideButtons')}
                                    className={itemClass}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${hideOpts.hideButtons ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                        {hideOpts.hideButtons && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span>隐藏按钮</span>
                                </button>

                                {/* 分隔线 */}
                                <div className={`h-px mx-1 my-1 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`} />

                                <button
                                    onClick={() => {
                                        onToggleAllVisibility?.();
                                        onClose();
                                    }}
                                    className={itemClass}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    <span>一键隐藏/显示所有</span>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : state.type === 'group' ? (
                <>
                    {/* 编辑分组名 */}
                    <button
                        onClick={() => {
                            if (state.targetGroupId) {
                                onEditGroup?.(state.targetGroupId);
                            }
                            onClose();
                        }}
                        className={`${itemClass} rounded-xl`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>修改分组名</span>
                    </button>
                </>
            ) : (
                <>
                    {/* 编辑链接 */}
                    <button
                        onClick={() => {
                            if (state.targetLink && state.targetGroupId) {
                                onEditLink(state.targetLink, state.targetGroupId);
                            }
                            onClose();
                        }}
                        className={`${itemClass} rounded-t-xl`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>编辑网站</span>
                    </button>

                    {/* 删除链接 */}
                    <button
                        onClick={() => {
                            if (state.targetLink && state.targetGroupId) {
                                onDeleteLink?.(state.targetLink, state.targetGroupId);
                            }
                            onClose();
                        }}
                        className={`${itemClass} text-red-500 hover:text-red-400 rounded-b-xl`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>删除网站</span>
                    </button>
                </>
            )}
        </div>
    );
};
