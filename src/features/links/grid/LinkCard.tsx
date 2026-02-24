import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SiteIcon } from '@/shared/components/SiteIcon';
import type { Link, Theme } from '@/constants';

interface LinkCardProps {
  link: Link;
  theme: Theme;
  isEditMode: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
  onDelete?: () => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  theme,
  isEditMode,
  onContextMenu,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
    disabled: !isEditMode,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const isLight = theme === 'light';
  const cardClass = isLight
    ? 'bg-white/40 hover:bg-white/80 border-white/60 hover:border-white shadow-sm hover:shadow-lg hover:shadow-blue-500/5 backdrop-blur-sm'
    : 'bg-white/5 hover:bg-white/15 border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-black/10';
  const iconBgClass = isLight ? 'bg-white/80 shadow-sm border border-white/50' : 'bg-white/10 shadow-inner';
  const textClass = isLight ? 'text-slate-600 font-medium group-hover:text-slate-900' : 'text-white/60 group-hover:text-white';

  return (
    <div className="relative group/item">
      <a
        ref={setNodeRef}
        style={style}
        href={isEditMode ? undefined : link.url}
        onClick={(event) => isEditMode && event.preventDefault()}
        onContextMenu={(event) => {
          event.preventDefault();
          onContextMenu?.(event);
        }}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
        className={`group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 focus:outline-none ${cardClass} ${
          isDragging ? 'opacity-50 scale-105 shadow-2xl z-50' : ''
        } ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'hover:-translate-y-1'}`}
      >
        <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center overflow-hidden ${iconBgClass}`}>
          <SiteIcon url={link.url} title={link.title} linkId={link.id} customIcon={link.icon} />
        </div>
        <span className={`text-xs font-medium truncate w-full text-center ${textClass}`}>{link.title}</span>
      </a>

      {isEditMode && !isDragging && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
          className={`absolute -top-2 -right-2 z-20 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 ${
            isLight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500/80 text-white hover:bg-red-500'
          }`}
          title="删除链接"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};
