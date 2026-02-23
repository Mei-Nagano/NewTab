import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePomodoroTimer } from '@/settings/tools/pomodoro/hooks/usePomodoroTimer';

describe('usePomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('switches mode and resets time', () => {
    const { result } = renderHook(() =>
      usePomodoroTimer({
        settings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          soundEnabled: true,
          transparentBg: true,
        },
      })
    );

    act(() => result.current.setMode('shortBreak'));
    expect(result.current.mode).toBe('shortBreak');
    expect(result.current.time).toBe(300);
  });

  it('counts down and triggers onTimeUp when reaches zero', () => {
    const onTimeUp = vi.fn();
    const { result } = renderHook(() =>
      usePomodoroTimer({
        settings: {
          workDuration: 1,
          shortBreakDuration: 1,
          longBreakDuration: 1,
          soundEnabled: true,
          transparentBg: true,
        },
        onTimeUp,
      })
    );

    act(() => {
      result.current.setDuration('work', 1);
      result.current.toggleRunning();
    });

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.running).toBe(false);
    expect(onTimeUp).toHaveBeenCalled();
  });
});
