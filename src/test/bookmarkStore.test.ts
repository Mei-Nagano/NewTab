import { describe, expect, it } from 'vitest';
import { extractBookmarkFoldersFromTree } from '@/services/storage/bookmarkStore';

describe('bookmarkStore', () => {
  it('extracts bookmark folders with direct links and keeps nested path in title', () => {
    const tree = [
      {
        id: '0',
        title: '',
        children: [
          {
            id: '1',
            title: '书签栏',
            children: [
              { id: '11', title: 'OpenAI', url: 'https://openai.com' },
              {
                id: '12',
                title: '开发',
                children: [
                  { id: '121', title: 'GitHub', url: 'https://github.com' },
                ],
              },
            ],
          },
        ],
      },
    ];

    const folders = extractBookmarkFoldersFromTree(tree);
    expect(folders).toHaveLength(2);
    expect(folders[0].title).toBe('书签栏');
    expect(folders[0].links).toHaveLength(1);
    expect(folders[1].title).toBe('书签栏 / 开发');
    expect(folders[1].links).toHaveLength(1);
  });
});
