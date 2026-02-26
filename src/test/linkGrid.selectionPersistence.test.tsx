import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinkGrid } from '@/features/links/grid/LinkGrid';

const GROUP_ID = 'g-work';
const STORAGE_KEY = 'newtab_selected_group_id';

const groups = [
  {
    id: GROUP_ID,
    title: '工作',
    links: [{ id: 'l-1', title: '工作台', url: 'https://example.com/work' }],
  },
  {
    id: 'g-life',
    title: '生活',
    links: [{ id: 'l-2', title: '生活台', url: 'https://example.com/life' }],
  },
];

describe('LinkGrid group selection persistence', () => {
  it('restores selected group after remount', () => {
    localStorage.removeItem(STORAGE_KEY);

    const { unmount } = render(
      <LinkGrid groups={groups} theme="light" linkDisplayMode="scroll" />
    );

    fireEvent.click(screen.getByText('工作'));
    expect(screen.getByText('工作台')).not.toBeNull();
    expect(screen.queryByText('生活台')).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(GROUP_ID);

    unmount();

    render(<LinkGrid groups={groups} theme="light" linkDisplayMode="scroll" />);
    expect(screen.getByText('工作台')).not.toBeNull();
    expect(screen.queryByText('生活台')).toBeNull();
  });
});
