import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { BrowserBookmarkFolderView, BookmarkImportTarget } from '@/settings/hooks/useSettingsModal/useBookmarkImport';

interface BookmarkImportViewProps {
  currentGroupTitle: string;
  importTarget: BookmarkImportTarget;
  onImportTargetChange: (target: BookmarkImportTarget) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  folders: BrowserBookmarkFolderView[];
  selectedLinkIds: Set<string>;
  expandedFolderIds: Set<string>;
  onToggleFolderExpand: (folderId: string) => void;
  onToggleFolderLinks: (folderId: string) => void;
  onToggleLink: (linkId: string) => void;
  onSelectAll: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
}

export const BookmarkImportView: React.FC<BookmarkImportViewProps> = ({
  currentGroupTitle,
  importTarget,
  onImportTargetChange,
  searchTerm,
  onSearchChange,
  folders,
  selectedLinkIds,
  expandedFolderIds,
  onToggleFolderExpand,
  onToggleFolderLinks,
  onToggleLink,
  onSelectAll,
  onConfirm,
  onCancel,
  theme,
}) => (
  <div className="flex flex-col flex-1 overflow-hidden">
    <div className={`p-4 border-b space-y-3 transition-colors ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
      <div className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>导入目标</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onImportTargetChange('current-group')}
          className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${importTarget === 'current-group'
            ? 'bg-blue-600 text-white border-blue-600'
            : theme === 'light'
              ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              : 'bg-white/5 text-gray-300 border-white/10 hover:border-blue-400/40'
            }`}
        >
          导入当前分组
        </button>
        <button
          onClick={() => onImportTargetChange('new-groups')}
          className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${importTarget === 'new-groups'
            ? 'bg-blue-600 text-white border-blue-600'
            : theme === 'light'
              ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              : 'bg-white/5 text-gray-300 border-white/10 hover:border-blue-400/40'
            }`}
        >
          导入为新分组
        </button>
      </div>

      <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        {importTarget === 'current-group'
          ? `将导入到当前分组：${currentGroupTitle}`
          : '将按所选书签所在文件夹创建新分组'}
      </p>

      <input
        type="text"
        placeholder="搜索分组或书签..."
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-all ${theme === 'light'
          ? 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
          : 'bg-black/40 border-white/10 text-white focus:border-blue-500/50'
          }`}
      />

      <button onClick={onSelectAll} className="text-xs text-blue-400 hover:text-blue-300">
        全选/取消全选当前结果
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
      {folders.map((folder) => {
        const folderFullySelected = folder.visibleLinks.length > 0 && folder.visibleLinks.every((link) => selectedLinkIds.has(link.id));
        const expanded = expandedFolderIds.has(folder.id);

        return (
          <div key={folder.id} className={`rounded-lg border transition-colors ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-white/10 bg-black/20'}`}>
            <div className={`flex items-center gap-3 p-3 ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}>
              <button
                onClick={() => onToggleFolderLinks(folder.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${folderFullySelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}
              >
                {folderFullySelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => onToggleFolderExpand(folder.id)}
                className={`flex-1 flex items-center justify-between gap-2 text-left ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}
              >
                <span className="text-sm font-semibold truncate">{folder.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{folder.visibleLinks.length} 项</span>
                  <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </div>

            {expanded && (
              <div className={`px-3 pb-3 pt-1 space-y-1 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                {folder.visibleLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => onToggleLink(link.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${selectedLinkIds.has(link.id)
                      ? theme === 'light' ? 'bg-blue-50' : 'bg-blue-600/10'
                      : theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedLinkIds.has(link.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                      {selectedLinkIds.has(link.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{link.title}</div>
                      <div className="text-xs text-gray-500 truncate">{link.url}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {folders.length === 0 && (
        <div className={`text-sm text-center py-12 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
          未找到匹配的书签分组或书签
        </div>
      )}
    </div>

    <div className={`p-4 border-t flex justify-end gap-3 transition-colors ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-[#1a1b1e] border-white/5'}`}>
      <button onClick={onCancel} className={`px-4 py-2 transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-gray-300 hover:text-white'}`}>
        取消
      </button>
      <button onClick={onConfirm} disabled={selectedLinkIds.size === 0} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-all shadow-md active:scale-95">
        {importTarget === 'current-group' ? `导入到当前分组 (${selectedLinkIds.size})` : `导入为新分组 (${selectedLinkIds.size})`}
      </button>
    </div>
  </div>
);
