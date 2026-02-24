import { SettingSection } from '../../components/SettingSection';

interface SystemSectionProps {
  theme: 'light' | 'dark';
  cacheClearStatus: string;
  onClearCache: () => void;
  onResetSettings: () => void;
}

export const SystemSection: React.FC<SystemSectionProps> = ({
  theme,
  cacheClearStatus,
  onClearCache,
  onResetSettings,
}) => {
  const isLight = theme === 'light';
  const subTextClass = `text-[11px] font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`;

  return (
    <SettingSection title="系统与数据" theme={theme} accentColor="bg-red-500">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onClearCache}
          className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isLight
            ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:shadow-gray-500/5'
            : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
        >
          <div className="text-sm font-bold">清理图标缓存</div>
          <div className={subTextClass}>{cacheClearStatus || '重置站点图标缓存'}</div>
        </button>
        <button
          onClick={onResetSettings}
          className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isLight
            ? 'border-red-100 bg-red-50/30 hover:bg-red-50 hover:border-red-200'
            : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
            }`}
        >
          <div className="text-sm font-bold text-red-500">恢复默认设置</div>
          <div className={subTextClass}>保留分组和链接</div>
        </button>
      </div>
    </SettingSection>
  );
};
