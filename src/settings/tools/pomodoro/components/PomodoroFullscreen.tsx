import { createPortal } from 'react-dom';
import { Minimize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PomodoroFullscreenProps {
  isOpen: boolean;
  timeText: string;
  running: boolean;
  soundEnabled: boolean;
  transparentBg: boolean;
  backgroundImage?: string;
  onToggleRunning: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleTransparentBg: () => void;
  onClose: () => void;
}

export const PomodoroFullscreen: React.FC<PomodoroFullscreenProps> = ({
  isOpen,
  timeText,
  running,
  soundEnabled,
  transparentBg,
  backgroundImage,
  onToggleRunning,
  onReset,
  onToggleSound,
  onToggleTransparentBg,
  onClose,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-fade-in overflow-hidden bg-black">
      {backgroundImage && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${transparentBg ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className={`absolute inset-0 transition-all duration-700 ${transparentBg ? 'backdrop-blur-md' : ''}`} />

      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
        <div className="absolute top-8 right-8 flex gap-4">
          <button onClick={onToggleSound} className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md">
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <button onClick={onToggleTransparentBg} className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md">
            {transparentBg ? <div className="w-6 h-6 border-2 border-white rounded opacity-50" /> : <div className="w-6 h-6 bg-white rounded opacity-50" />}
          </button>
          <button onClick={onClose} className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md">
            <Minimize2 size={24} />
          </button>
        </div>

        <div className="text-[15rem] leading-none font-bold text-white tracking-tighter drop-shadow-2xl font-mono select-none">{timeText}</div>
        <div className="text-2xl font-medium text-white/60 uppercase tracking-[1em] mt-4 mb-16 select-none">{running ? 'Focusing' : 'Paused'}</div>

        <div className="flex items-center gap-8">
          <button onClick={onToggleRunning} className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-2xl shadow-rose-500/30">
            {running ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
          <button onClick={onReset} className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md">
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
