import { SettingsSidebar } from './SettingsSidebar';

interface SettingsFrameProps {
  theme: 'light' | 'dark';
  activeTab: 'general' | 'links' | 'backup' | 'tools' | 'about';
  updateStatus: 'checking' | 'latest' | 'outdated' | 'error' | 'idle';
  onTabChange: (tab: 'general' | 'links' | 'backup' | 'tools' | 'about') => void;
  children: React.ReactNode;
}

export const SettingsFrame: React.FC<SettingsFrameProps> = ({
  theme,
  activeTab,
  updateStatus,
  onTabChange,
  children,
}) => {
  return (
    <div className={`relative w-full max-w-5xl h-[85vh] border rounded-2xl shadow-2xl overflow-hidden flex animate-slide-up ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1b1e] border-white/5'}`}>
      <SettingsSidebar
        activeTab={activeTab}
        setActiveTab={onTabChange}
        theme={theme}
        updateStatus={updateStatus}
        onTabChange={() => undefined}
      />
      {children}
    </div>
  );
};
