import { describe, expect, it, vi } from 'vitest';
import { buildBlankMenu } from '@/context-menu/builders/buildBlankMenu';
import { buildGroupMenu } from '@/context-menu/builders/buildGroupMenu';
import { buildLinkMenu } from '@/context-menu/builders/buildLinkMenu';

describe('context-menu builders', () => {
  it('buildBlankMenu should include hide-options submenu', () => {
    const paginationItems = buildBlankMenu({
      isLight: true,
      isEditMode: false,
      isPaginationMode: true,
      hideOptions: undefined,
      onToggleTheme: vi.fn(),
      onSaveWallpaper: vi.fn(),
      onToggleEditMode: vi.fn(),
      onOpenSettings: vi.fn(),
      onToggleHideOption: vi.fn(),
      onToggleAllVisibility: vi.fn(),
    });
    expect(paginationItems.some((item) => item.id === 'hide-options')).toBe(true);
    const hideMenu = paginationItems.find((item) => item.id === 'hide-options');
    expect(hideMenu?.children?.some((item) => item.id === 'hpc')).toBe(true);

    const scrollItems = buildBlankMenu({
      isLight: true,
      isEditMode: false,
      isPaginationMode: false,
      hideOptions: undefined,
      onToggleTheme: vi.fn(),
      onSaveWallpaper: vi.fn(),
      onToggleEditMode: vi.fn(),
      onOpenSettings: vi.fn(),
      onToggleHideOption: vi.fn(),
      onToggleAllVisibility: vi.fn(),
    });
    const scrollHideMenu = scrollItems.find((item) => item.id === 'hide-options');
    expect(scrollHideMenu?.children?.some((item) => item.id === 'hpc')).toBe(false);
  });

  it('buildLinkMenu should return edit and delete actions', () => {
    const items = buildLinkMenu({
      targetLink: { id: '1', title: 'A', url: 'https://a.com' },
      targetGroupId: 'g1',
      onEditLink: vi.fn(),
      onDeleteLink: vi.fn(),
    });
    expect(items.map((item) => item.id)).toEqual(['edit-link', 'delete-link']);
  });

  it('buildGroupMenu should return edit action when group exists', () => {
    const items = buildGroupMenu({
      targetGroupId: 'g1',
      onEditGroup: vi.fn(),
    });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('edit-group');
  });
});
