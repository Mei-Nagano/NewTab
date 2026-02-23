import { GroupDropdown } from '../components/GroupDropdown';
import { ALL_GROUP_ID } from '../constants';
import type { LinkGroup } from '@/types';

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
  const totalLinks = groups.reduce((sum, group) => sum + group.links.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>分组管理</h4>
      </div>

      <div className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-gray-50/50 border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <GroupDropdown groups={groups} activeGroupId={activeGroupId} isAllGroupSelected={isAllGroupSelected} allCount={totalLinks} isOpen={isDropdownOpen} onToggle={onToggleDropdown} onSelect={onSelectGroup} theme={theme} />
            <button onClick={onAddGroup} className={`p-4 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-100 text-gray-600' : 'bg-white/5 border-white/5 text-gray-400'}`} title="新建分组">+</button>
            <button onClick={() => onDeleteGroup(activeGroupId)} disabled={isAllGroupSelected} className={`p-4 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-100 text-gray-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`} title="删除分组">-</button>
          </div>

          <div className="flex items-center gap-4">
            <input
              value={isAllGroupSelected ? '所有链接' : editingGroupTitle}
              onChange={(event) => onRenameGroup(event.target.value)}
              disabled={isAllGroupSelected}
              className={`flex-1 px-5 py-3 rounded-2xl border text-sm font-bold outline-none ${theme === 'light' ? 'bg-white border-gray-100 text-gray-900' : 'bg-black/20 border-white/5 text-white'}`}
              placeholder="重命名分组"
            />
            <button
              onClick={onStartImport}
              disabled={isFetchingBookmarks || isAllGroupSelected || activeGroupId === ALL_GROUP_ID}
              className={`px-6 py-3 rounded-2xl text-sm font-bold border ${theme === 'light' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-white border-transparent'}`}
            >
              {isFetchingBookmarks ? '加载中...' : '导入书签'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
