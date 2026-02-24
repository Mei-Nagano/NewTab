import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Link } from '@/constants';
import { SiteIcon } from '@/shared/components/SiteIcon';

interface SortableLinkItemProps {
    link: Link;
    isEditing: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    theme: 'light' | 'dark';
}

export const SortableLinkItem: React.FC<SortableLinkItemProps> = ({
    link, isEditing, isSelected, onSelect, onEdit, onDelete, theme
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        // Prevent transform easing while dragging to keep movement in sync with pointer.
        transition: isDragging ? 'none' : transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${isDragging
                ? (theme === 'light' ? 'opacity-50 scale-[1.02] shadow-2xl z-50 bg-white border-blue-200' : 'opacity-50 scale-[1.02] shadow-2xl z-50 bg-gray-800 border-blue-500/50')
                : isEditing
                    ? (theme === 'light' ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/10' : 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/10')
                    : isSelected
                        ? (theme === 'light' ? 'bg-blue-50 border-blue-300 shadow-sm shadow-blue-500/5' : 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/5')
                        : (theme === 'light' ? 'bg-white hover:bg-gray-50 border-gray-100 hover:border-blue-200 hover:shadow-md hover:shadow-gray-200/50' : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/[0.08]')
                }`}
        >
            <div {...attributes} {...listeners} className={`flex-shrink-0 p-2 cursor-grab active:cursor-grabbing touch-none rounded-xl transition-all ${theme === 'light' ? 'text-gray-300 hover:text-blue-500 hover:bg-blue-50' : 'text-gray-600 hover:text-blue-400 hover:bg-white/5'
                }`} title="拖拽排序">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>

            <div className="flex-1 flex items-center gap-4 min-w-0" onClick={() => !isEditing && onSelect()}>
                <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center transition-all ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-black/20 border-white/5'}`}>
                        <SiteIcon
                            url={link.url}
                            title={link.title}
                            linkId={link.id}
                            customIcon={link.icon}
                            size="w-6 h-6"
                            className="object-contain"
                        />
                    </div>
                    {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-[#1a1b1e] flex items-center justify-center animate-scale-in">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                    )}
                </div>

                <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold truncate transition-colors ${theme === 'light'
                        ? (isSelected || isEditing ? 'text-blue-600' : 'text-gray-900')
                        : (isSelected || isEditing ? 'text-blue-400' : 'text-white/90')
                        }`}>{link.title}</span>
                    <span className={`text-xs truncate ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>{link.url}</span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className={`p-2 rounded-xl transition-all ${isEditing
                        ? 'text-amber-500 bg-amber-500/10'
                        : (theme === 'light' ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-400 hover:bg-white/10')
                        }`}
                    title="编辑"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                    title="删除"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
            </div>
        </div>
    );
};
