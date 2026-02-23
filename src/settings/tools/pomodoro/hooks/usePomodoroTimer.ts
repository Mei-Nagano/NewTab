import { useEffect, useMemo, useState } from 'react';
import type { PomodoroSettings } from '@/types';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface UsePomodoroTimerOptions {
  settings: PomodoroSettings;
  onTimeUp?: () => void;
}

export interface PomodoroTimerState {
  mode: PomodoroMode;
  time: number;
  running: boolean;
  durations: Record<PomodoroMode, number>;
  setMode: (mode: PomodoroMode) => void;
  setDuration: (mode: PomodoroMode, minutes: number) => void;
  toggleRunning: () => void;
  reset: () => void;
  stop: () => void;
}

export const usePomodoroTimer = ({ settings, onTimeUp }: UsePomodoroTimerOptions): PomodoroTimerState => {
  const durations = useMemo(
    () => ({
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    }),
    [settings.longBreakDuration, settings.shortBreakDuration, settings.workDuration]
  );

  const [mode, setModeState] = useState<PomodoroMode>('work');
  const [time, setTime] = useState(durations.work * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setTime(durations[mode] * 60);
  }, [durations, mode]);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      onTimeUp?.();
      return;
    }

    const timer = window.setInterval(() => {
      setTime((previous) => previous - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, time, onTimeUp]);

  const setMode = (nextMode: PomodoroMode) => {
    setModeState(nextMode);
    setRunning(false);
    setTime(durations[nextMode] * 60);
  };

  const setDuration = (targetMode: PomodoroMode, minutes: number) => {
    if (mode !== targetMode) return;
    setTime(minutes * 60);
    setRunning(false);
  };

  return {
    mode,
    time,
    running,
    durations,
    setMode,
    setDuration,
    toggleRunning: () => setRunning((value) => !value),
    reset: () => {
      setRunning(false);
      setTime(durations[mode] * 60);
    },
    stop: () => setRunning(false),
  };
};
