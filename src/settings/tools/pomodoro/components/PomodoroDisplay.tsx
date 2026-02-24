type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroDisplayProps {
  theme: 'light' | 'dark';
  time: number;
  mode: PomodoroMode;
  running: boolean;
  duration: number;
  onDurationChange: (minutes: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const PomodoroDisplay: React.FC<PomodoroDisplayProps> = ({
  theme,
  time,
  running,
  duration,
  onDurationChange,
}) => {
  const hintClass = theme === 'light' ? 'text-gray-700' : 'text-gray-500';
  const inputClass =
    theme === 'light'
      ? 'bg-white border-gray-300 text-gray-900'
      : 'bg-white/5 border-white/10 text-white';

  return (
    <>
      <div className="relative mb-8">
        <div className={`text-8xl font-mono font-bold tracking-tighter transition-colors ${running ? 'text-rose-500' : theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
          {formatTime(time)}
        </div>
        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
          {running ? 'RUNNING' : 'PAUSED'}
        </div>
      </div>

      {!running && (
        <div className="mb-8 flex items-center gap-2">
          <span className={`text-xs ${hintClass}`}>当前模式时长(分钟):</span>
          <input
            type="number"
            min="1"
            max="120"
            value={duration}
            onChange={(event) =>
              onDurationChange(Math.max(1, parseInt(event.target.value || '1', 10)))
            }
            className={`w-16 p-1 text-center text-sm rounded-lg border outline-none focus:ring-2 focus:ring-rose-500/20 ${inputClass}`}
          />
        </div>
      )}
    </>
  );
};
