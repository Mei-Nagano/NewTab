import { SiteIcon } from '@/components/common/SiteIcon';
import type { Link, Theme } from '@/constants';

interface LinkDragOverlayProps {
  link: Link;
  theme: Theme;
}

export const LinkDragOverlay: React.FC<LinkDragOverlayProps> = ({ link, theme }) => {
  const isLight = theme === 'light';
  const cardClass = isLight
    ? 'bg-white/90 border-white shadow-2xl shadow-blue-500/10'
    : 'bg-white/15 border-white/20 shadow-2xl shadow-black/20';
  const iconBgClass = isLight ? 'bg-white/90 shadow-sm border border-white/50' : 'bg-white/10 shadow-inner';
  const textClass = isLight ? 'text-slate-700 font-bold' : 'text-white/60';

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 scale-105 ${cardClass}`}>
      <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center overflow-hidden ${iconBgClass}`}>
        <SiteIcon url={link.url} title={link.title} linkId={link.id} customIcon={link.icon} />
      </div>
      <span className={`text-xs font-medium truncate w-full text-center ${textClass}`}>{link.title}</span>
    </div>
  );
};
