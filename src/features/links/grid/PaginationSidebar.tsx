import type { Theme } from '@/constants';

interface PaginationSidebarProps {
  theme: Theme;
  currentPage: number;
  totalPages: number;
  isExpanded: boolean;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const PaginationSidebar: React.FC<PaginationSidebarProps> = ({
  theme,
  currentPage,
  totalPages,
  isExpanded,
  onPageChange,
  onPrev,
  onNext,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (totalPages <= 1) return null;

  const isLight = theme === 'light';
  const buttonClass = isLight
    ? 'bg-white/40 border-white text-slate-600 hover:bg-white/80 disabled:opacity-30'
    : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/15 disabled:opacity-20';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex flex-col items-center animate-fade-in transition-all duration-300 ${isLight ? 'bg-white/35 border-white/50' : 'bg-black/20 border-white/10'} backdrop-blur-md border rounded-2xl ${isExpanded ? 'gap-4 px-2.5 py-3' : 'gap-2 px-2 py-2.5'}`}
    >
      <button onClick={onPrev} disabled={currentPage === 0} className={`${isExpanded ? 'p-2.5 rounded-full' : 'hidden'} transition-all duration-300 ${buttonClass} border disabled:cursor-not-allowed active:scale-90`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
      </button>
      <div className={`${isExpanded ? 'flex' : 'hidden'} flex-col items-center gap-2.5 max-h-[42vh] overflow-y-auto py-1`}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => onPageChange(index)}
            className={`h-2 rounded-full transition-all duration-500 focus:outline-none ${currentPage === index ? (isLight ? 'bg-blue-500 h-7 w-2.5' : 'bg-blue-400 h-7 w-2.5') : isLight ? 'bg-slate-300 h-2 w-2 hover:bg-slate-400' : 'bg-white/20 h-2 w-2 hover:bg-white/40'}`}
          />
        ))}
      </div>
      {!isExpanded && (
        <div className="flex flex-col items-center justify-center gap-1.5 py-1 px-0.5">
          <span className={`text-[12px] font-black leading-none ${isLight ? 'text-slate-700' : 'text-white/90'}`}>{currentPage + 1}</span>
          <div className={`w-3 h-[2px] rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
          <span className={`text-[10px] font-bold leading-none ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{totalPages}</span>
        </div>
      )}
      <button onClick={onNext} disabled={currentPage === totalPages - 1} className={`${isExpanded ? 'p-2.5 rounded-full' : 'hidden'} transition-all duration-300 ${buttonClass} border disabled:cursor-not-allowed active:scale-90`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
    </div>
  );
};
