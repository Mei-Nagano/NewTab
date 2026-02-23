import { SiteIcon } from '@/components/common/SiteIcon';
import type { LinkFormState } from '../types';

interface LinkFormSectionProps {
  theme: 'light' | 'dark';
  form: LinkFormState;
  isAllGroupSelected: boolean;
  editingLinkId: string | null;
  onChange: (form: LinkFormState) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
}

export const LinkFormSection: React.FC<LinkFormSectionProps> = ({
  theme,
  form,
  isAllGroupSelected,
  editingLinkId,
  onChange,
  onSubmit,
  onCancelEdit,
}) => {
  return (
    <div className="space-y-4" id="link-form">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 bg-orange-500 rounded-full" />
        <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>{editingLinkId ? '编辑链接' : '添加链接'}</h4>
      </div>

      <div className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-gray-50/50 border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl border overflow-hidden">
            <SiteIcon url={form.url} title={form.title} customIcon={form.icon} size="w-full h-full" className="rounded-xl" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input className={`w-full px-5 py-3 rounded-2xl border text-sm font-bold outline-none ${theme === 'light' ? 'bg-white border-gray-100 text-gray-900' : 'bg-black/20 border-white/5 text-white'}`} placeholder="网站标题" value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} />
              <input className={`w-full px-5 py-3 rounded-2xl border text-sm font-bold outline-none ${theme === 'light' ? 'bg-white border-gray-100 text-gray-900' : 'bg-black/20 border-white/5 text-white'}`} placeholder="链接 URL" value={form.url} onChange={(event) => onChange({ ...form, url: event.target.value })} />
            </div>

            <div className="flex justify-end gap-3">
              {editingLinkId && (
                <button onClick={onCancelEdit} className={`px-6 py-2.5 rounded-xl text-xs font-bold ${theme === 'light' ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-white/5'}`}>
                  取消
                </button>
              )}
              <button
                onClick={onSubmit}
                disabled={isAllGroupSelected || !form.title.trim() || !form.url.trim()}
                className={`px-8 py-2.5 rounded-xl text-xs font-bold text-white ${(isAllGroupSelected || !form.title.trim() || !form.url.trim()) ? 'bg-gray-400 cursor-not-allowed' : editingLinkId ? 'bg-amber-500 hover:bg-amber-400' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                {editingLinkId ? '保存修改' : '添加到当前分组'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
