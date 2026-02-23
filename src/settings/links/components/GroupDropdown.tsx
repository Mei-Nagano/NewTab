import type { LinkGroup } from '@/types';
import { ALL_GROUP_ID, ALL_GROUP_TITLE } from '../constants';

interface GroupDropdownProps {
  groups: LinkGroup[];
  activeGroupId: string;
  isAllGroupSelected: boolean;
  allCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (groupId: string) => void;
  theme: 'light' | 'dark';
}

export const GroupDropdown: React.FC<GroupDropdownProps> = ({
  groups,
  activeGroupId,
  isAllGroupSelected,
  allCount,
  isOpen,
  onToggle,
  onSelect,
  theme,
}) => {
  const activeGroup = isAllGroupSelected
    ? { id: ALL_GROUP_ID, title: ALL_GROUP_TITLE, links: [] }
    : groups.find((group) => group.id === activeGroupId) || groups[0];

  return (
    <div className="relative flex-1">
      <button
        onClick={onToggle}
        className={`w-full px-5 py-4 rounded-2xl border flex items-center justify-between ${theme === 'light' ? 'bg-white border-gray-100 text-gray-900' : 'bg-black/20 border-white/5 text-white'}`}
      >
        <div className="text-left">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">当前分组</span>
          <div className="text-sm font-bold">{activeGroup?.title || ALL_GROUP_TITLE}</div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 z-50 border rounded-2xl shadow-2xl overflow-hidden ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1b1e] border-white/10'}`}>
          <div className="p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
            <button onClick={() => onSelect(ALL_GROUP_ID)} className={`w-full text-left px-4 py-3 text-sm rounded-xl flex items-center justify-between ${isAllGroupSelected ? 'bg-blue-600 text-white' : theme === 'light' ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/5'}`}>
              <span className="font-bold">{ALL_GROUP_TITLE}</span>
              <span className="text-xs">({allCount})</span>
            </button>
            {groups.map((group) => (
              <button key={group.id} onClick={() => onSelect(group.id)} className={`w-full text-left px-4 py-3 text-sm rounded-xl flex items-center justify-between ${group.id === activeGroupId ? 'bg-blue-600 text-white' : theme === 'light' ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/5'}`}>
                <span className="font-bold">{group.title}</span>
                {group.id === activeGroupId && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
