import type { Link } from '@/types';
import { isExtensionEnvironment } from './envBridge';

declare const chrome: any;

export interface BrowserBookmarkFolder {
  id: string;
  title: string;
  links: Link[];
}

const mapBookmarkLink = (node: any): Link => ({
  id: `bm-${node.id}`,
  title: node.title || '未命名书签',
  url: node.url,
});

const normalizeFolderTitle = (nodeTitle: string | undefined, path: string[]): string => {
  const current = (nodeTitle || '').trim();
  if (path.length === 0 && !current) {
    return '未命名分组';
  }
  if (!current) {
    return path[path.length - 1] || '未命名分组';
  }
  if (path.length === 0) return current;
  return `${path.join(' / ')} / ${current}`;
};

const collectFolderGroups = (
  node: any,
  path: string[],
  folders: BrowserBookmarkFolder[]
) => {
  if (!Array.isArray(node?.children)) {
    return;
  }

  const directLinks = node.children.filter((child: any) => typeof child?.url === 'string' && child.url.length > 0);
  if (directLinks.length > 0) {
    folders.push({
      id: String(node.id || `folder-${folders.length + 1}`),
      title: normalizeFolderTitle(node.title, path),
      links: directLinks.map(mapBookmarkLink),
    });
  }

  const nextPath = node.title ? [...path, node.title] : path;
  node.children
    .filter((child: any) => Array.isArray(child?.children))
    .forEach((child: any) => collectFolderGroups(child, nextPath, folders));
};

export const extractBookmarkFoldersFromTree = (tree: any[]): BrowserBookmarkFolder[] => {
  if (!Array.isArray(tree)) return [];
  const folders: BrowserBookmarkFolder[] = [];
  tree.forEach((node) => collectFolderGroups(node, [], folders));
  return folders.filter((folder) => folder.links.length > 0);
};

export const getBrowserBookmarkFolders = async (): Promise<BrowserBookmarkFolder[]> => {
  if (!isExtensionEnvironment() || !chrome.bookmarks?.getTree) {
    return [];
  }

  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree: any[]) => {
      resolve(extractBookmarkFoldersFromTree(tree));
    });
  });
};

export const getBrowserBookmarks = async (): Promise<Link[]> => {
  const folders = await getBrowserBookmarkFolders();
  return folders.flatMap((folder) => folder.links);
};
