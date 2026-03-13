import React from 'react';

interface ContextMenuItemProps {
    id: string;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
    onFocus?: React.FocusEventHandler<HTMLButtonElement>;
    onBlur?: React.FocusEventHandler<HTMLButtonElement>;
    className?: string;
    isLight: boolean;
    checked?: boolean;
    reserveLeadingSlot?: boolean;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
    label,
    icon,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    className,
    isLight,
    checked,
    reserveLeadingSlot = false,
}) => {
    const shouldShowLeadingSlot = reserveLeadingSlot || checked !== undefined || Boolean(icon);
    const baseItemClass = `flex items-center px-3 py-2 text-sm cursor-pointer transition-colors w-full text-left outline-none rounded-lg ${shouldShowLeadingSlot ? 'gap-3' : ''}`;
    const themeClass = isLight
        ? `text-slate-700 hover:bg-black/5 hover:text-slate-900 focus:bg-black/5 focus:text-slate-900`
        : `text-gray-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white`;

    return (
        <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`${baseItemClass} ${themeClass} ${className || ''}`}
        >
            {shouldShowLeadingSlot && (
                <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${checked ? (isLight ? 'text-blue-600' : 'text-white') : 'opacity-70'}`}>
                    {checked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        icon
                    )}
                </div>
            )}

            <span className={`flex-1 truncate`}>{label}</span>
        </button>
    );
};
