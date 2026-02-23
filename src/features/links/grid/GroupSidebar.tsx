import type { LinkGroup, Theme } from '@/constants';
import { ALL_GROUP_ID } from './constants';

interface GroupSidebarProps {
  groups: LinkGroup[];
  selectedGroupId: string;
  totalLinkCount: number;
  theme: Theme;
  onSelectGroup: (groupId: string) => void;
  onGroupContextMenu?: (event: React.MouseEvent, groupId: string) => void;
}

export const GroupSidebar: React.FC<GroupSidebarProps> = ({
  groups,
  selectedGroupId,
  totalLinkCount,
  theme,
  onSelectGroup,
  onGroupContextMenu,
}) => {
  const isLight = theme === 'light';
  const activeClass = isLight ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-indigo-500/35 border-indigo-400/60 text-white';
  const inactiveClass = isLight
    ? 'bg-white/55 border-white text-slate-600 hover:bg-white/80'
    : 'bg-white/5 border-white/10 text-white/65 hover:bg-white/10';

  return (
    <div className={`flex flex-col items-stretch gap-2 p-2 max-h-[48vh] overflow-y-auto animate-fade-in transition-all duration-300 ${isLight ? 'bg-white/35 border-white/50' : 'bg-black/20 border-white/10'} backdrop-blur-md border rounded-2xl`}>
      <button
        onClick={() => onSelectGroup(ALL_GROUP_ID)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold tracking-wide transition-all ${selectedGroupId === ALL_GROUP_ID ? activeClass : inactiveClass}`}
      >
        <span className="truncate">所有链接</span>
        <span className={selectedGroupId === ALL_GROUP_ID ? 'text-white/90' : isLight ? 'text-slate-500' : 'text-white/35'}>({totalLinkCount})</span>
      </button>

      {groups.map((group) => (
        <button
          key={group.id}
          onClick={() => onSelectGroup(group.id)}
          onContextMenu={(event) => onGroupContextMenu?.(event, group.id)}
          className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold tracking-wide transition-all ${selectedGroupId === group.id ? activeClass : inactiveClass}`}
        >
          <span className="truncate">{group.title}</span>
          <span className={selectedGroupId === group.id ? 'text-white/90' : isLight ? 'text-slate-500' : 'text-white/35'}>({group.links.length})</span>
        </button>
      ))}
    </div>
  );
};
