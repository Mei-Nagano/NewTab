import React from 'react';
import { ChevronDown, Check, Layers } from 'lucide-react';
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
  const isLight = theme === 'light';
  const activeGroup = isAllGroupSelected
    ? { id: ALL_GROUP_ID, title: ALL_GROUP_TITLE, links: [] }
    : groups.find((group) => group.id === activeGroupId) || groups[0];

  return (
    <div className="relative flex-1">
      <button
        onClick={onToggle}
        className={`w-full px-5 py-4 rounded-3xl border flex items-center justify-between transition-all duration-300 ${isLight
            ? 'bg-white border-gray-100 text-gray-900 hover:border-blue-200 hover:shadow-lg hover:shadow-gray-200/50'
            : 'bg-black/20 border-white/5 text-white hover:bg-white/10 hover:border-white/10'
          }`}
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`p-2 rounded-xl ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-500/10 text-blue-400'}`}>
            <Layers size={18} />
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>选择分组</span>
            <div className="text-sm font-black truncate max-w-[120px] md:max-w-none">{activeGroup?.title || ALL_GROUP_TITLE}</div>
          </div>
        </div>
        <ChevronDown size={20} className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-3 z-[60] border backdrop-blur-xl animate-scale-in rounded-[2rem] shadow-2xl overflow-hidden ${isLight ? 'bg-white/95 border-gray-100' : 'bg-gray-900/95 border-white/10'
          }`}>
          <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar space-y-1">
            <button
              onClick={() => onSelect(ALL_GROUP_ID)}
              className={`w-full text-left px-4 py-4 text-sm rounded-2xl flex items-center justify-between transition-all duration-300 ${isAllGroupSelected
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : isLight ? 'text-gray-700 hover:bg-gray-100/50' : 'text-gray-300 hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-black">{ALL_GROUP_TITLE}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isAllGroupSelected ? 'bg-white/20' : isLight ? 'bg-gray-200' : 'bg-white/10'}`}>
                  {allCount}
                </span>
              </div>
              {isAllGroupSelected && <Check size={16} strokeWidth={3} />}
            </button>
            <div className={`h-px mx-2 my-1 ${isLight ? 'bg-gray-100' : 'bg-white/5'}`} />
            {groups.map((group) => {
              const isSelected = !isAllGroupSelected && group.id === activeGroupId;
              return (
                <button
                  key={group.id}
                  onClick={() => onSelect(group.id)}
                  className={`w-full text-left px-4 py-4 text-sm rounded-2xl flex items-center justify-between transition-all duration-300 ${isSelected
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : isLight ? 'text-gray-700 hover:bg-gray-100/50' : 'text-gray-300 hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black">{group.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white/20' : isLight ? 'bg-gray-200' : 'bg-white/10'}`}>
                      {group.links.length}
                    </span>
                  </div>
                  {isSelected && <Check size={16} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
