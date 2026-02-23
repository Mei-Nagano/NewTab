interface SettingsHeaderProps {
  activeTab: 'general' | 'links' | 'backup' | 'tools' | 'about';
  theme: 'light' | 'dark';
  onClose: () => void;
}

const TAB_TITLES: Record<SettingsHeaderProps['activeTab'], string> = {
  general: '常规设置',
  links: '链接管理',
  backup: '备份与恢复',
  tools: '实用工具',
  about: '关于',
};

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ activeTab, theme, onClose }) => {
  return (
    <div className={`h-16 flex items-center justify-between px-8 border-b flex-shrink-0 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
      <h3 className={`text-lg font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{TAB_TITLES[activeTab]}</h3>
      <button
        onClick={onClose}
        className={`p-2 -mr-2 rounded-lg transition-colors ${theme === 'light' ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
