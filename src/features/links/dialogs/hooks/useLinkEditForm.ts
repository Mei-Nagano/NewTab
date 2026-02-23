import { useEffect, useState } from 'react';
import type { Link } from '@/constants';

interface UseLinkEditFormResult {
  title: string;
  url: string;
  icon: string;
  setTitle: (title: string) => void;
  setUrl: (url: string) => void;
  setIcon: (icon: string) => void;
  resetFromLink: (link: Link) => void;
  buildUpdatedLink: (link: Link) => Link | null;
}

export const useLinkEditForm = (link: Link): UseLinkEditFormResult => {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [icon, setIcon] = useState(link.icon || '');

  useEffect(() => {
    setTitle(link.title);
    setUrl(link.url);
    setIcon(link.icon || '');
  }, [link]);

  const resetFromLink = (nextLink: Link) => {
    setTitle(nextLink.title);
    setUrl(nextLink.url);
    setIcon(nextLink.icon || '');
  };

  const buildUpdatedLink = (current: Link): Link | null => {
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();
    if (!trimmedTitle || !trimmedUrl) {
      return null;
    }

    const finalUrl =
      trimmedUrl.startsWith('http') || trimmedUrl.startsWith('data:')
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    return {
      ...current,
      title: trimmedTitle,
      url: finalUrl,
      icon: icon || undefined,
    };
  };

  return {
    title,
    url,
    icon,
    setTitle,
    setUrl,
    setIcon,
    resetFromLink,
    buildUpdatedLink,
  };
};
