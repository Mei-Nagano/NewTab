import { useMemo, useState } from 'react';
import { getCommonStyles } from '@/components/settings/tools/shared';
import { DEFAULT_POMODORO } from '@/constants';
import type { AppSettings, PomodoroSettings } from '@/types';
import { PomodoroControls } from './components/PomodoroControls';
import { PomodoroDisplay } from './components/PomodoroDisplay';
import { PomodoroFullscreen } from './components/PomodoroFullscreen';
import { PomodoroModeTabs } from './components/PomodoroModeTabs';
import { usePomodoroAudio } from './hooks/usePomodoroAudio';
import { usePomodoroFullscreenHotkey } from './hooks/usePomodoroFullscreenHotkey';
import { usePomodoroTimer } from './hooks/usePomodoroTimer';

interface PomodoroToolProps {
  theme: 'light' | 'dark';
  backgroundImage?: string;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const PomodoroTool: React.FC<PomodoroToolProps> = ({
  theme,
  backgroundImage,
  settings,
  onSettingsChange,
}) => {
  const styles = getCommonStyles(theme);
  const pomodoroSettings = settings.pomodoro || DEFAULT_POMODORO;
  const [fullscreen, setFullscreen] = useState(false);
  const { playRing } = usePomodoroAudio();

  const updatePomodoro = (updates: Partial<PomodoroSettings>) => {
    onSettingsChange({
      ...settings,
      pomodoro: { ...pomodoroSettings, ...updates },
    });
  };

  const timer = usePomodoroTimer({
    settings: pomodoroSettings,
    onTimeUp: () => {
      if (pomodoroSettings.soundEnabled) {
        playRing();
      }
    },
  });

  usePomodoroFullscreenHotkey(fullscreen, () => setFullscreen(false));

  const currentDuration = useMemo(() => timer.durations[timer.mode], [timer.durations, timer.mode]);

  return (
    <section>
      <div className={styles.sectionTitleClass}>
        <div className={`${styles.sectionDotClass} bg-rose-500`} />
        <h4 className={styles.sectionHeadingClass}>番茄时钟</h4>
      </div>
      <div className={styles.cardClass}>
        <div className="flex flex-col items-center py-8">
          <PomodoroModeTabs theme={theme} mode={timer.mode} onModeChange={timer.setMode} />
          <PomodoroDisplay
            theme={theme}
            time={timer.time}
            mode={timer.mode}
            running={timer.running}
            duration={currentDuration}
            onDurationChange={(minutes) => {
              timer.setDuration(timer.mode, minutes);
              const field = timer.mode === 'work' ? 'workDuration' : timer.mode === 'shortBreak' ? 'shortBreakDuration' : 'longBreakDuration';
              updatePomodoro({ [field]: minutes });
            }}
          />
          <PomodoroControls
            theme={theme}
            running={timer.running}
            soundEnabled={pomodoroSettings.soundEnabled}
            onToggleSound={() => updatePomodoro({ soundEnabled: !pomodoroSettings.soundEnabled })}
            onToggleRunning={timer.toggleRunning}
            onReset={timer.reset}
            onToggleFullscreen={() => setFullscreen((value) => !value)}
          />
        </div>
      </div>
      <PomodoroFullscreen
        isOpen={fullscreen}
        timeText={formatTime(timer.time)}
        running={timer.running}
        soundEnabled={pomodoroSettings.soundEnabled}
        transparentBg={pomodoroSettings.transparentBg}
        backgroundImage={backgroundImage}
        onToggleRunning={timer.toggleRunning}
        onReset={timer.reset}
        onToggleSound={() => updatePomodoro({ soundEnabled: !pomodoroSettings.soundEnabled })}
        onToggleTransparentBg={() => updatePomodoro({ transparentBg: !pomodoroSettings.transparentBg })}
        onClose={() => setFullscreen(false)}
      />
    </section>
  );
};
