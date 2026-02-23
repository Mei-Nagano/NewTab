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
  return (
    <section className="space-y-4">
      <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>系统与数据</h4>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onClearCache} className={`p-4 rounded-2xl border text-left ${theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/10 bg-white/5'}`}>
          <div className="text-sm font-bold">清理图标缓存</div>
          <div className="text-[11px] text-gray-500">{cacheClearStatus || '重置站点图标缓存'}</div>
        </button>
        <button onClick={onResetSettings} className={`p-4 rounded-2xl border text-left ${theme === 'light' ? 'border-red-100 bg-red-50/30' : 'border-red-500/20 bg-red-500/5'}`}>
          <div className="text-sm font-bold text-red-500">恢复默认设置</div>
          <div className="text-[11px] text-gray-500">保留分组和链接</div>
        </button>
      </div>
    </section>
  );
};
