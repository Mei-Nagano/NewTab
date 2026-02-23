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
  const bgClass = isLight ? 'bg-white' : 'bg-gray-900';
  const borderClass = isLight ? 'border-gray-200' : 'border-gray-700';
  const textClass = isLight ? 'text-gray-900' : 'text-white';
  const mutedClass = isLight ? 'text-gray-500' : 'text-gray-400';
  const inputClass = isLight
    ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
    : 'bg-gray-800 border-gray-700 text-white focus:border-blue-500';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onContextMenu={(event) => event.preventDefault()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm ${bgClass} border ${borderClass} rounded-2xl shadow-2xl overflow-hidden animate-slide-up`}>
        <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
          <h3 className={`text-lg font-semibold ${textClass}`}>编辑网站</h3>
          <button onClick={onClose} className={`${mutedClass} transition-colors hover:${textClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <LinkEditForm
          title={form.title}
          url={form.url}
          icon={form.icon}
          mutedClass={mutedClass}
          inputClass={inputClass}
          onTitleChange={form.setTitle}
          onUrlChange={form.setUrl}
          onIconChange={form.setIcon}
        />

        <div className={`flex justify-end gap-3 p-4 border-t ${borderClass}`}>
          <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-lg ${mutedClass}`}>
            取消
          </button>
          <button
            onClick={() => {
              const nextLink = form.buildUpdatedLink(link);
              if (!nextLink) return;
              onSave(nextLink);
              onClose();
            }}
            disabled={!form.title.trim() || !form.url.trim()}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              form.title.trim() && form.url.trim() ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
