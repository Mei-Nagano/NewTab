import type { Link } from '@/types';
import { isExtensionEnvironment } from './envBridge';

declare const chrome: any;

const traverseBookmarkNode = (node: any, links: Link[]) => {
  if (node.url) {
    links.push({
      id: `bm-${node.id}`,
      title: node.title,
      url: node.url,
    });
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child: any) => traverseBookmarkNode(child, links));
  }
};

export const getBrowserBookmarks = async (): Promise<Link[]> => {
  if (!isExtensionEnvironment() || !chrome.bookmarks?.getTree) {
    return [];
  }

  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree: any[]) => {
      const links: Link[] = [];
      if (Array.isArray(tree)) {
        tree.forEach((node) => traverseBookmarkNode(node, links));
      }
      resolve(links);
    });
  });
};
