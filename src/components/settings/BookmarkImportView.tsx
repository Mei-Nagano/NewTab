import React from 'react';
import type { Link } from '../../constants';

interface BookmarkImportViewProps {
    groupTitle: string;
    searchTerm: string;
    onSearchChange: (v: string) => void;
    candidates: Link[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectAll: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    theme: 'light' | 'dark';
}

export const BookmarkImportView: React.FC<BookmarkImportViewProps> = ({
    groupTitle, searchTerm, onSearchChange, candidates, selectedIds, onToggle, onSelectAll, onConfirm, onCancel, theme
}) => (
    <div className="flex flex-col flex-1 overflow-hidden">
        <div className={`p-4 border-b space-y-3 transition-colors ${theme === 'light' ? 'border-gray-100' : 'border-white/5'
            }`}>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>导入至: <span className={`${theme === 'light' ? 'text-gray-900' : 'text-white'} font-semibold`}>{groupTitle}</span></p>
            <input
                type="text"
                placeholder="搜索书签..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-all ${theme === 'light'
                        ? 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                        : 'bg-black/40 border-white/10 text-white focus:border-blue-500/50'
                    }`}
            />
            <button onClick={onSelectAll} className="text-xs text-blue-400 hover:text-blue-300">
                {selectedIds.size === candidates.length ? '取消全选' : '全选所有结果'}
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {candidates.map(b => (
                <div key={b.id} onClick={() => onToggle(b.id)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedIds.has(b.id)
                    ? (theme === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-600/10 border border-blue-500/50')
                    : (theme === 'light' ? 'hover:bg-gray-50 border border-transparent' : 'hover:bg-white/5 border border-transparent')
                    }`}>
                    <div className={`w-4 h-4 rounded border transition-colors ${selectedIds.has(b.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`} />
                    <div className="flex flex-col overflow-hidden">
                        <span className={`text-sm font-medium truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{b.title}</span>
                        <span className="text-xs text-gray-500 truncate">{b.url}</span>
                    </div>
                </div>
            ))}
        </div>
        <div className={`p-4 border-t flex justify-end gap-3 transition-colors ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-[#1a1b1e] border-white/5'
            }`}>
            <button onClick={onCancel} className={`px-4 py-2 transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-gray-300 hover:text-white'
                }`}>取消</button>
            <button onClick={onConfirm} disabled={selectedIds.size === 0} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-all shadow-md active:scale-95">
                导入 ({selectedIds.size})
            </button>
        </div>
    </div>
);