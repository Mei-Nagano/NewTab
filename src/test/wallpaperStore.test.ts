import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchBingWallpaper,
  fetchRandomWallpaper,
  listFavoriteWallpapers,
  removeFavoriteWallpaper,
  saveFavoriteWallpaper,
} from '@/services/storage/wallpaperStore';

class MockFileReader {
  public result: string | ArrayBuffer | null = null;
  public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  public error: DOMException | null = null;

  readAsDataURL(blob: Blob) {
    this.result = `data:${blob.type || 'image/jpeg'};base64,mock-wallpaper`;
    this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
  }
}

describe('wallpaperStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.stubGlobal('FileReader', MockFileReader);
  });

  it('reuses the cached Bing wallpaper within the same day', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ images: [{ url: '/th?id=test-wallpaper.jpg' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(new Blob(['img'], { type: 'image/jpeg' }), {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        })
      );

    vi.stubGlobal('fetch', fetchMock);

    const first = await fetchBingWallpaper();
    const second = await fetchBingWallpaper();

    expect(first).toBe('data:image/jpeg;base64,mock-wallpaper');
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('adds wallpaper favorites once and prevents duplicates', async () => {
    await expect(saveFavoriteWallpaper('data:image/png;base64,favorite-1')).resolves.toBe('added');
    await expect(saveFavoriteWallpaper('data:image/png;base64,favorite-1')).resolves.toBe('exists');

    const favorites = await listFavoriteWallpapers();
    expect(favorites).toHaveLength(1);
    expect(favorites[0]?.image).toBe('data:image/png;base64,favorite-1');
  });

  it('resolves random wallpaper to the exact image data that is displayed', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Blob(['img'], { type: 'image/jpeg' }), {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchRandomWallpaper()).resolves.toBe('data:image/jpeg;base64,mock-wallpaper');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toMatch(/^https:\/\/picsum\.photos\/1920\/1080\?random=\d+$/);
  });

  it('removes a favorite wallpaper by id', async () => {
    await saveFavoriteWallpaper('data:image/png;base64,favorite-1');
    const [favorite] = await listFavoriteWallpapers();
    if (!favorite) {
      throw new Error('Expected a saved favorite wallpaper.');
    }

    await removeFavoriteWallpaper(favorite.id);

    await expect(listFavoriteWallpapers()).resolves.toEqual([]);
  });
});
