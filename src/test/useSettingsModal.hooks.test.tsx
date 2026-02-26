import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSettingsModal } from '@/settings/hooks/useSettingsModal';
import { createSettingsFixture } from './fixtures/settings';
import { SELECTED_GROUP_STORAGE_KEY } from '@/features/links/grid/constants';
import { getBrowserBookmarkFolders } from '@/services/storage';

vi.mock('@/services/storage', async () => {
  const actual = await vi.importActual<typeof import('@/services/storage')>('@/services/storage');
  return {
    ...actual,
    getBrowserBookmarkFolders: vi.fn(),
  };
});

const getBrowserBookmarkFoldersMock = vi.mocked(getBrowserBookmarkFolders);

describe('useSettingsModal', () => {
  afterEach(() => {
    localStorage.removeItem(SELECTED_GROUP_STORAGE_KEY);
    vi.clearAllMocks();
  });

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

  it('defaults to the home page selected group when opening links settings', () => {
    const settings = createSettingsFixture({
      groups: [
        { id: 'g-a', title: 'Group A', links: [] },
        { id: 'g-b', title: 'Group B', links: [] },
      ],
    });

    localStorage.setItem(SELECTED_GROUP_STORAGE_KEY, 'g-b');

    const { result } = renderHook(() =>
      useSettingsModal({
        isOpen: true,
        settings,
        onSave: vi.fn(),
        onClose: vi.fn(),
      })
    );

    expect(result.current.activeGroupId).toBe('g-b');
  });

  it('skips duplicate links when importing bookmarks', async () => {
    getBrowserBookmarkFoldersMock.mockResolvedValue([
      {
        id: 'folder-1',
        title: 'Imported',
        links: [
          { id: 'bm-1', title: 'Dup', url: 'https://example.com/' },
          { id: 'bm-2', title: 'New', url: 'https://new.example.com' },
        ],
      },
    ]);

    const settings = createSettingsFixture({
      groups: [
        {
          id: 'g-a',
          title: 'A',
          links: [{ id: 'l-1', title: 'Existing', url: 'https://example.com' }],
        },
      ],
    });

    const { result } = renderHook(() =>
      useSettingsModal({
        isOpen: true,
        settings,
        onSave: vi.fn(),
        onClose: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.startImport();
    });

    act(() => {
      result.current.toggleSelectAllImport();
    });

    act(() => {
      result.current.confirmImport();
    });

    const links = result.current.tempSettings.groups[0]?.links || [];
    expect(links).toHaveLength(2);
    expect(links.some((link) => link.url.includes('new.example.com'))).toBe(true);
    expect(result.current.alertConfig.isOpen).toBe(true);
    expect(result.current.alertConfig.message).toContain('自动跳过 1 条重复链接');
  });
});
