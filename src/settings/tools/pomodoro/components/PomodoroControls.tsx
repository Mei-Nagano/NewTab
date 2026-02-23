import { Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PomodoroControlsProps {
  theme: 'light' | 'dark';
  running: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleRunning: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

export const PomodoroControls: React.FC<PomodoroControlsProps> = ({
  theme,
  running,
  soundEnabled,
  onToggleSound,
  onToggleRunning,
  onReset,
  onToggleFullscreen,
}) => {
  const smallBtn = `w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
    theme === 'light'
      ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
      : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
  }`;

  return (
    <div className="flex items-center gap-4">
      <button onClick={onToggleSound} className={`${smallBtn} ${soundEnabled ? '' : 'opacity-50'}`}>
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
      <button onClick={onToggleFullscreen} className={smallBtn}>
        <Maximize2 size={20} />
      </button>
      <button
        onClick={onToggleRunning}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${
          running
            ? theme === 'light'
              ? 'bg-white border-2 border-gray-100 text-gray-500 hover:text-rose-500'
              : 'bg-white/10 text-gray-300 hover:text-white'
            : 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600'
        }`}
      >
        {running ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
      </button>
      <button onClick={onReset} className={smallBtn}>
        <RotateCcw size={20} />
      </button>
    </div>
  );
};
