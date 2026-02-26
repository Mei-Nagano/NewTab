import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSettingsFixture } from './fixtures/settings';
import { useGroupActions } from '@/settings/links/hooks/useGroupActions';
import { useLinkActions } from '@/settings/links/hooks/useLinkActions';
import { useSelection } from '@/settings/links/hooks/useSelection';

describe('settings links hooks', () => {
  it('useSelection toggles ids and select all', () => {
    const { result } = renderHook(() => useSelection());

    act(() => result.current.toggleSelection('a'));
    expect(result.current.selectedLinkIds.has('a')).toBe(true);

    act(() => result.current.toggleSelectAll(['x', 'y']));
    expect([...result.current.selectedLinkIds]).toEqual(['x', 'y']);
  });

  it('useGroupActions adds and deletes group', () => {
    let currentSettings = createSettingsFixture();
    const onSettingsChange = vi.fn((next) => {
      currentSettings = next;
    });
    const setActiveGroupId = vi.fn();

    const { result } = renderHook(() =>
      useGroupActions({
        settings: currentSettings,
        activeGroupId: currentSettings.groups[0].id,
        isAllGroupSelected: false,
        onSettingsChange,
        setActiveGroupId,
      })
    );

    act(() => result.current.addGroup());
    expect(onSettingsChange).toHaveBeenCalled();

    const latest = onSettingsChange.mock.calls.at(-1)?.[0];
    if (!latest) throw new Error('missing settings update');

    const deleteHook = renderHook(() =>
      useGroupActions({
        settings: latest,
        activeGroupId: latest.groups[1]?.id || latest.groups[0].id,
        isAllGroupSelected: false,
        onSettingsChange,
        setActiveGroupId,
      })
    );

    act(() => deleteHook.result.current.deleteGroup(latest.groups[1].id));
    expect(onSettingsChange).toHaveBeenCalledTimes(2);
  });

  it('useLinkActions skips duplicate links when adding', () => {
    const settings = createSettingsFixture({
      groups: [
        {
          id: 'g-a',
          title: 'A',
          links: [{ id: 'l-1', title: 'Example', url: 'https://example.com/' }],
        },
      ],
    });
    const onSettingsChange = vi.fn();

    const { result } = renderHook(() =>
      useLinkActions({
        settings,
        activeGroupId: 'g-a',
        isAllGroupSelected: false,
        onSettingsChange,
      })
    );

    let saveResult: ReturnType<typeof result.current.saveLink> | undefined;
    act(() => {
      saveResult = result.current.saveLink(
        { title: 'Duplicate', url: 'example.com', icon: '' },
        null
      );
    });

    expect(saveResult).toBe('duplicate');
    expect(onSettingsChange).not.toHaveBeenCalled();
  });
});
