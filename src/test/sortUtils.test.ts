import { describe, expect, it } from 'vitest';
import type { LinkGroup } from '@/types';
import { reorderItems, reorderLinksAcrossGroups, reorderLinksInGroup } from '@/shared/utils';

describe('sortUtils', () => {
  it('reorderItems should move item within array', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const result = reorderItems(items, 'a', 'c');
    expect(result.map((item) => item.id)).toEqual(['b', 'c', 'a']);
  });

  it('reorderLinksInGroup should reorder only target group', () => {
    const groups: LinkGroup[] = [
      { id: 'g1', title: 'G1', links: [{ id: '1', title: '1', url: '1' }, { id: '2', title: '2', url: '2' }] },
      { id: 'g2', title: 'G2', links: [{ id: '3', title: '3', url: '3' }] },
    ];
    const result = reorderLinksInGroup(groups, 'g1', '1', '2');
    expect(result[0].links.map((item) => item.id)).toEqual(['2', '1']);
    expect(result[1].links.map((item) => item.id)).toEqual(['3']);
  });

  it('reorderLinksAcrossGroups should move item to target group', () => {
    const groups: LinkGroup[] = [
      { id: 'g1', title: 'G1', links: [{ id: '1', title: '1', url: '1' }] },
      { id: 'g2', title: 'G2', links: [{ id: '2', title: '2', url: '2' }, { id: '3', title: '3', url: '3' }] },
    ];
    const result = reorderLinksAcrossGroups(groups, '1', '3');
    expect(result[0].links).toHaveLength(0);
    expect(result[1].links.map((item) => item.id)).toEqual(['2', '1', '3']);
  });
});
