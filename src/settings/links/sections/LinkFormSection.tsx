import { SiteIcon } from '@/shared/components/SiteIcon';
import type { LinkFormState } from '../types';
import { SettingSection } from '../../components/SettingSection';

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
  const isLight = theme === 'light';

  return (
    <SettingSection
      title={editingLinkId ? '编辑链接' : '添加链接'}
      theme={theme}
      accentColor="bg-orange-500"
    >
      <div className="flex items-start gap-6">
        <div className={`w-16 h-16 rounded-2xl border overflow-hidden flex-shrink-0 transition-all duration-300 ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-black/20 border-white/5'}`}>
          <SiteIcon url={form.url} title={form.title} customIcon={form.icon} size="w-full h-full" className="rounded-xl" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              className={`w-full px-5 py-3 rounded-2xl border text-sm font-bold outline-none transition-all ${isLight ? 'bg-white border-gray-100 text-gray-900 focus:border-orange-500 shadow-sm focus:shadow-orange-500/10' : 'bg-black/20 border-white/5 text-white focus:border-orange-500/50'}`}
              placeholder="网站标题"
              value={form.title}
              onChange={(event) => onChange({ ...form, title: event.target.value })}
            />
            <input
              className={`w-full px-5 py-3 rounded-2xl border text-sm font-bold outline-none transition-all ${isLight ? 'bg-white border-gray-100 text-gray-900 focus:border-orange-500 shadow-sm focus:shadow-orange-500/10' : 'bg-black/20 border-white/5 text-white focus:border-orange-500/50'}`}
              placeholder="链接 URL"
              value={form.url}
              onChange={(event) => onChange({ ...form, url: event.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {editingLinkId && (
              <button
                onClick={onCancelEdit}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-white/5'}`}
              >
                取消
              </button>
            )}
            <button
              onClick={onSubmit}
              disabled={isAllGroupSelected || !form.title.trim() || !form.url.trim()}
              className={`px-8 py-2.5 rounded-xl text-xs font-bold text-white transition-all ${(isAllGroupSelected || !form.title.trim() || !form.url.trim()) ? 'bg-gray-400 cursor-not-allowed opacity-50' : editingLinkId ? 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
            >
              {editingLinkId ? '保存修改' : '添加到当前分组'}
            </button>
          </div>
        </div>
      </div>
    </SettingSection>
  );
};
