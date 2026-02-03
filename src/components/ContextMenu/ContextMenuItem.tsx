import React from 'react';

interface ContextMenuItemProps {
    id: string;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    isLight: boolean;
    checked?: boolean;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
    label,
    icon,
    onClick,
    className,
    isLight,
    checked
}) => {
    const baseItemClass = `flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors w-full text-left outline-none rounded-lg`;
    const themeClass = isLight
        ? `text-slate-700 hover:bg-black/5 hover:text-slate-900 focus:bg-black/5 focus:text-slate-900`
        : `text-gray-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white`;

    return (
        <button
            onClick={onClick}
            className={`${baseItemClass} ${themeClass} ${className || ''}`}
        >
            {/* Checkbox column or Icon column */}
            <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${checked ? (isLight ? 'text-blue-600' : 'text-white') : 'opacity-70'}`}>
                {checked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                ) : (
                    icon
                )}
            </div>

            <span className={`flex-1 truncate`}>{label}</span>
        </button>
    );
};
