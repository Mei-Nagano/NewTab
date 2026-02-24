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

  return (
    <SettingSection title="分组管理" theme={theme} accentColor="bg-blue-500">
      <div className="space-y-6">
        {/* Group Selector Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-3">
            <div className="flex-1">
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
            </div>
            <div className="flex gap-2">
              <button
                onClick={onAddGroup}
                className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] ${isLight
                    ? 'bg-white border-gray-100 text-gray-600 hover:border-blue-500 hover:text-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-400'
                  }`}
                title="新建分组"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={() => onDeleteGroup(activeGroupId)}
                disabled={isAllGroupSelected}
                className={`p-4 rounded-2xl border transition-all duration-300 ${isAllGroupSelected
                    ? 'opacity-30 cursor-not-allowed'
                    : (isLight
                      ? 'bg-white border-gray-100 text-gray-400 hover:border-red-500 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/10'
                      : 'bg-white/5 border-white/5 text-gray-500 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400')
                  }`}
                title="删除当前分组"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Rename & Action Row */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest px-1 flex items-center gap-2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
              <FolderEdit size={12} />
              分组设置
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={isAllGroupSelected ? '所有已添加链接 (不可重命名)' : editingGroupTitle}
                  onChange={(event) => onRenameGroup(event.target.value)}
                  disabled={isAllGroupSelected}
                  className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-bold outline-none transition-all duration-300 ${isLight
                      ? 'bg-white border-gray-100 text-gray-900 focus:border-blue-500 focus:shadow-inner'
                      : 'bg-black/20 border-white/5 text-white focus:border-blue-500/50'
                    } ${isAllGroupSelected ? 'opacity-50 italic select-none' : ''}`}
                  placeholder="为选中的分组起个名字..."
                />
              </div>
              <button
                onClick={onStartImport}
                disabled={isFetchingBookmarks || isAllGroupSelected || activeGroupId === ALL_GROUP_ID}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black border transition-all duration-300 shadow-xl ${isFetchingBookmarks || isAllGroupSelected || activeGroupId === ALL_GROUP_ID
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
      </div>
    </SettingSection>
  );
};
