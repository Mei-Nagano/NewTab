import React, { useState, useRef, useLayoutEffect } from 'react';
import type { MenuItem } from '../types';
import { ContextMenuItem } from './ContextMenuItem';
import { ContextMenuSeparator } from './ContextMenuSeparator';

interface SubMenuProps {
    item: MenuItem;
    isLight: boolean;
    onClose: () => void;
    menuClass: string;
}

export const SubMenu: React.FC<SubMenuProps> = ({ item, isLight, onClose, menuClass }) => {
    const [show, setShow] = useState(false);
    const [alignLeft, setAlignLeft] = useState(false);
    const [alignUp, setAlignUp] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const submenuRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShow(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShow(false);
        }, 150); // 150ms delay to allow crossing the gap
    };

    useLayoutEffect(() => {
        if (show && submenuRef.current && triggerRef.current) {
            const submenuRect = submenuRef.current.getBoundingClientRect();
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Horizontal alignment check
            if (triggerRect.right + submenuRect.width > viewportWidth) {
                setAlignLeft(true);
            } else {
                setAlignLeft(false);
            }

            // Vertical alignment check
            const spaceBelow = viewportHeight - triggerRect.top;
            const spaceAbove = triggerRect.bottom;
            if (spaceBelow < submenuRect.height && spaceAbove > submenuRect.height) {
                setAlignUp(true);
            } else {
                setAlignUp(false);
            }
        }
    }, [show]);

    // Simplified rounded logic: Submenu container always rounded
    const getSubmenuRoundedClass = () => 'rounded-2xl p-1.5';

    // Trigger button styling
    const triggerActiveClass = show
        ? (isLight
            ? 'bg-black/5 text-slate-900'
            : 'bg-white/10 text-white')
        : '';

    return (
        <div
            ref={triggerRef}
            className="relative w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <ContextMenuItem
                id={item.id}
                label={item.label}
                icon={item.icon}
                isLight={isLight}
                className={`justify-between ${triggerActiveClass}`}
                onClick={(e: React.MouseEvent) => {
                    e?.stopPropagation();
                    // Click should toggle immediately, but also handle timer safety
                    if (show) {
                        handleMouseLeave(); // Treat click-close like a leave to close gracefully? Or instant?
                        // Actually for click toggle:
                        setShow(!show);
                    } else {
                        handleMouseEnter();
                    }
                }}
            />
            {/* Chevron Icon */}
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${show ? (alignLeft ? '-rotate-180' : '') : ''}`}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={show ? (isLight ? '#2563EB' : 'white') : (isLight ? '#64748B' : 'rgba(255,255,255,0.5)')}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>


            {show && (
                <div
                    ref={submenuRef}
                    className={`absolute z-20 
                        ${alignLeft ? 'right-full mr-2' : 'left-full ml-2'} 
                        ${alignUp ? 'bottom-[-6px]' : 'top-[-6px]'}
                        min-w-[200px] overflow-hidden animate-context-menu ${menuClass} ${getSubmenuRoundedClass()}`}
                >
                    <div className="flex flex-col">
                        {item.children?.map((child) => {
                            if (child.type === 'separator') {
                                return <ContextMenuSeparator key={child.id} isLight={isLight} />;
                            }
                            return (
                                <ContextMenuItem
                                    key={child.id}
                                    id={child.id}
                                    label={child.label}
                                    icon={child.icon}
                                    isLight={isLight}
                                    checked={child.checked}
                                    reserveLeadingSlot={true}
                                    className={``}
                                    onClick={() => {
                                        child.onClick?.();
                                        if (!child.children) onClose();
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
