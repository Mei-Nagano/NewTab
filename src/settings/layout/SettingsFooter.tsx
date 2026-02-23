interface SettingsFooterProps {
  theme: 'light' | 'dark';
  onCancel: () => void;
  onSave: () => void;
}

export const SettingsFooter: React.FC<SettingsFooterProps> = ({ theme, onCancel, onSave }) => {
  return (
    <div className={`px-8 py-5 border-t flex items-center justify-end gap-3 backdrop-blur-sm flex-shrink-0 ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-[#1a1b1e]/50 border-white/5'}`}>
      <button
        onClick={onCancel}
        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        取消
      </button>
      <button onClick={onSave} className="px-6 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all">
        保存更改
      </button>
    </div>
  );
};
