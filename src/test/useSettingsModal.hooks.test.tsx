import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSettingsModal } from '@/settings/hooks/useSettingsModal';
import { createSettingsFixture } from './fixtures/settings';

describe('useSettingsModal', () => {
  it('keeps tempSettings changes when activeGroupId updates', () => {
    const settings = createSettingsFixture();
    const { result } = renderHook(() =>
      useSettingsModal({
        isOpen: true,
        settings,
        onSave: vi.fn(),
        onClose: vi.fn(),
      })
    );

    const newGroupId = 'g-new';
    act(() => {
      result.current.setTempSettings((previous) => ({
        ...previous,
        groups: [...previous.groups, { id: newGroupId, title: '新分组', links: [] }],
      }));
      result.current.setActiveGroupId(newGroupId);
    });

    expect(result.current.activeGroupId).toBe(newGroupId);
    expect(result.current.tempSettings.groups.some((group) => group.id === newGroupId)).toBe(true);
  });
});
