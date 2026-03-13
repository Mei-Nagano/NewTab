import { useLinkEditForm } from './hooks/useLinkEditForm';
import { LinkEditForm } from './LinkEditForm';
import type { Link, Theme } from '@/constants';

interface LinkEditDialogProps {
  isOpen: boolean;
  link: Link;
  theme: Theme;
  onClose: () => void;
  onSave: (updatedLink: Link) => void;
}

export const LinkEditDialog: React.FC<LinkEditDialogProps> = ({
  isOpen,
  link,
  theme,
  onClose,
  onSave,
}) => {
  const form = useLinkEditForm(link);
  const isLight = theme === 'light';
  const canSave = Boolean(form.title.trim() && form.url.trim());
  const enabledSaveClass = isLight
    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-200'
    : 'bg-white text-gray-900 hover:bg-gray-200 shadow-white/5';
  const saveButtonClass = canSave
    ? enabledSaveClass
    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭编辑链接弹窗"
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-sm border transition-all duration-500 shadow-2xl overflow-hidden animate-slide-up rounded-[2.5rem] ${isLight ? 'bg-white/90 border-gray-100' : 'bg-gray-950/90 border-white/10'
        }`}>
        <div className="p-8 pt-10">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className={`text-xl font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>编辑信息</h3>
              <p className={`text-[11px] font-bold uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Site Information</p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all duration-300 ${isLight ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-900' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <LinkEditForm
            title={form.title}
            url={form.url}
            icon={form.icon}
            theme={theme}
            onTitleChange={form.setTitle}
            onUrlChange={form.setUrl}
            onIconChange={form.setIcon}
          />

          <div className="flex items-center gap-3 mt-10">
            <button
              onClick={onClose}
              className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${isLight ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              取消
            </button>
            <button
              onClick={() => {
                const nextLink = form.buildUpdatedLink(link);
                if (!nextLink) return;
                onSave(nextLink);
                onClose();
              }}
              disabled={!canSave}
              className={`flex-[1.5] py-4 text-sm font-black rounded-2xl transition-all duration-300 shadow-xl ${saveButtonClass}`}
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
