type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroModeTabsProps {
  theme: 'light' | 'dark';
  mode: PomodoroMode;
  onModeChange: (mode: PomodoroMode) => void;
}

const MODES: Array<{ id: PomodoroMode; label: string }> = [
  { id: 'work', label: '专注' },
  { id: 'shortBreak', label: '短休息' },
  { id: 'longBreak', label: '长休息' },
];

export const PomodoroModeTabs: React.FC<PomodoroModeTabsProps> = ({
  theme,
  mode,
  onModeChange,
}) => {
  return (
    <div className={`flex w-full max-w-sm mx-auto p-1 rounded-xl mb-8 ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
      {MODES.map((item) => (
        <button
          key={item.id}
          onClick={() => onModeChange(item.id)}
          className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === item.id
              ? theme === 'light'
                ? 'bg-white text-rose-500 shadow-sm'
                : 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
