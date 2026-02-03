import React from 'react';

interface ContextMenuSeparatorProps {
    isLight: boolean;
}

export const ContextMenuSeparator: React.FC<ContextMenuSeparatorProps> = ({ isLight }) => {
    return (
        <div className={`h-px mx-1 my-1 ${isLight ? 'bg-slate-200/60' : 'bg-white/10'}`} />
    );
};
