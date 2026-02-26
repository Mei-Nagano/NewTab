import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinkGrid } from '@/features/links/grid/LinkGrid';

const createManyLinks = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `l-${index + 1}`,
    title: `Link ${index + 1}`,
    url: `https://example.com/${index + 1}`,
  }));

describe('pagination controls', () => {
  it('hides pagination sidebar when hidePaginationControls is true', () => {
    render(
      <LinkGrid
        groups={[
          {
            id: 'g-1',
            title: '常用',
            links: createManyLinks(25),
          },
        ]}
        theme="light"
        linkDisplayMode="pagination"
        hidePaginationControls={true}
      />
    );

    expect(screen.queryByTestId('pagination-sidebar')).toBeNull();
  });

  it('shows pagination sidebar when hidePaginationControls is false', () => {
    render(
      <LinkGrid
        groups={[
          {
            id: 'g-1',
            title: '常用',
            links: createManyLinks(25),
          },
        ]}
        theme="light"
        linkDisplayMode="pagination"
        hidePaginationControls={false}
      />
    );

    expect(screen.getByTestId('pagination-sidebar')).not.toBeNull();
  });
});
