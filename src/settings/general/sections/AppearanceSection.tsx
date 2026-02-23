import type { AppSettings } from '@/types';

interface AppearanceSectionProps {
  settings: AppSettings;
  theme: 'light' | 'dark';
  onSettingsChange: (settings: AppSettings) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  settings,
  theme,
  onSettingsChange,
}) => {
  return (
    <section className="space-y-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>外观与布局</h4>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onSettingsChange({ ...settings, linkDisplayMode: 'scroll' })} className={`p-4 rounded-2xl border text-left ${settings.linkDisplayMode !== 'pagination' ? 'border-blue-500 bg-blue-500/10' : theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>
          <div className="text-sm font-bold">滚动展示</div>
          <div className="text-[11px] text-gray-500">纵向滚动布局</div>
        </button>
        <button onClick={() => onSettingsChange({ ...settings, linkDisplayMode: 'pagination' })} className={`p-4 rounded-2xl border text-left ${settings.linkDisplayMode === 'pagination' ? 'border-blue-500 bg-blue-500/10' : theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>
          <div className="text-sm font-bold">分页展示</div>
          <div className="text-[11px] text-gray-500">固定网格翻页</div>
        </button>
      </div>

      <button onClick={() => onSettingsChange({ ...settings, showSeconds: !settings.showSeconds })} className={`w-full p-4 rounded-2xl border text-left ${settings.showSeconds ? 'border-blue-500 bg-blue-500/10' : theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>
        <div className="text-sm font-bold">时钟显示秒数</div>
        <div className="text-[11px] text-gray-500">{settings.showSeconds ? '已开启' : '已关闭'}</div>
      </button>
    </section>
  );
};
