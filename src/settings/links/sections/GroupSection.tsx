import { Plus, Trash2, FolderEdit, DownloadCloud } from 'lucide-react';
import { GroupDropdown } from '../components/GroupDropdown';
import { ALL_GROUP_ID } from '../constants';
import type { LinkGroup } from '@/types';
import { SettingSection } from '../../components/SettingSection';

interface GroupSectionProps {
  theme: 'light' | 'dark';
  groups: LinkGroup[];
  activeGroupId: string;
  isAllGroupSelected: boolean;
  isDropdownOpen: boolean;
  isFetchingBookmarks: boolean;
  editingGroupTitle: string;
  onToggleDropdown: () => void;
  onSelectGroup: (groupId: string) => void;
  onAddGroup: () => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (title: string) => void;
  onStartImport: () => void;
}

export const GroupSection: React.FC<GroupSectionProps> = ({
  theme,
  groups,
  activeGroupId,
  isAllGroupSelected,
  isDropdownOpen,
  isFetchingBookmarks,
  editingGroupTitle,
  onToggleDropdown,
  onSelectGroup,
  onAddGroup,
  onDeleteGroup,
  onRenameGroup,
  onStartImport,
}) => {
  const isLight = theme === 'light';
  const totalLinks = groups.reduce((sum, group) => sum + group.links.length, 0);
  const activeGroup = groups.find((group) => group.id === activeGroupId);
  const activeGroupLabel = isAllGroupSelected ? '所有链接' : activeGroup?.title || '未选择分组';
  const activeGroupCount = isAllGroupSelected ? totalLinks : activeGroup?.links.length || 0;

  return (
    <SettingSection title="分组管理" theme={theme} accentColor="bg-blue-500">
      <div className="space-y-3.5">
        <div className={`rounded-2xl border px-4 py-3 transition-all duration-300 ${isLight ? 'bg-white border-gray-100' : 'bg-white/5 border-white/10'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <div className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>当前分组</div>
              <div className="mt-1 flex items-center gap-2 min-w-0">
                <span className={`text-sm font-black truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{activeGroupLabel}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/20 text-blue-300'}`}>{activeGroupCount} 项</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onAddGroup}
                className={`h-9 px-3.5 rounded-lg border inline-flex items-center justify-center gap-1.5 text-xs font-black transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${isLight
                    ? 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-300'
                  }`}
              >
                <Plus size={14} />
                新建分组
              </button>
              <button
                onClick={() => onDeleteGroup(activeGroupId)}
                disabled={isAllGroupSelected}
                className={`h-9 px-3.5 rounded-lg border inline-flex items-center justify-center gap-1.5 text-xs font-black transition-all duration-300 ${isAllGroupSelected
                    ? 'opacity-30 cursor-not-allowed'
                    : (isLight
                      ? 'bg-white border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300')
                  }`}
              >
                <Trash2 size={14} />
                删除分组
              </button>
            </div>
          </div>
        </div>

        <GroupDropdown
          groups={groups}
          activeGroupId={activeGroupId}
          isAllGroupSelected={isAllGroupSelected}
          allCount={totalLinks}
          isOpen={isDropdownOpen}
          onToggle={onToggleDropdown}
          onSelect={onSelectGroup}
          theme={theme}
        />

        <div className="space-y-2">
          <label className={`text-[10px] font-black uppercase tracking-widest px-1 flex items-center gap-2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
            <FolderEdit size={12} />
            分组设置
          </label>
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <div className="flex-1 relative">
              <input
                type="text"
                value={isAllGroupSelected ? '所有已添加链接 (不可重命名)' : editingGroupTitle}
                onChange={(event) => onRenameGroup(event.target.value)}
                disabled={isAllGroupSelected}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all duration-300 ${isLight
                    ? 'bg-white border-gray-100 text-gray-900 focus:border-blue-500 focus:shadow-inner'
                    : 'bg-black/20 border-white/5 text-white focus:border-blue-500/50'
                  } ${isAllGroupSelected ? 'opacity-50 italic select-none' : ''}`}
                placeholder="为选中的分组起个名字..."
              />
            </div>
            <button
              onClick={onStartImport}
              disabled={isFetchingBookmarks || isAllGroupSelected || activeGroupId === ALL_GROUP_ID}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black border transition-all duration-300 shadow-xl md:min-w-[132px] ${isFetchingBookmarks || isAllGroupSelected || activeGroupId === ALL_GROUP_ID
                  ? 'opacity-30 cursor-not-allowed grayscale'
                  : (isLight
                    ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 shadow-gray-200'
                    : 'bg-white text-gray-900 border-white hover:bg-gray-200 shadow-white/5')
                }`}
            >
              {isFetchingBookmarks ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <DownloadCloud size={18} />
              )}
              <span>浏览器导入</span>
            </button>
          </div>
        </div>
      </div>
    </SettingSection>
  );
};
