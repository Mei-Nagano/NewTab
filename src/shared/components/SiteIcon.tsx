import React, { useEffect, useState } from 'react';
import {
  loadCachedFavicon,
  loadLegacyCachedFaviconSource,
  saveCachedFavicon,
} from '@/services/storage';

interface IconCandidate {
  src: string;
  persistLocally: boolean;
}

const blobToDataUrl = async (blob: Blob): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read icon blob.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read icon blob.'));
    reader.readAsDataURL(blob);
  });
};

const fetchIconAsDataUrl = async (src: string, signal: AbortSignal): Promise<string> => {
  const response = await fetch(src, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch icon: ${response.status}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error('Fetched icon blob is empty.');
  }

  const contentType = blob.type.toLowerCase();
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error('Fetched content is not an image.');
  }

  return await blobToDataUrl(blob);
};

const loadImage = async (src: string, signal: AbortSignal): Promise<void> => {
  return await new Promise<void>((resolve, reject) => {
    const image = new Image();

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener('abort', handleAbort);
    };

    const handleAbort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    image.onload = () => {
      cleanup();
      resolve();
    };
    image.onerror = () => {
      cleanup();
      reject(new Error('Image failed to load.'));
    };

    signal.addEventListener('abort', handleAbort);
    if (signal.aborted) {
      handleAbort();
      return;
    }

    image.src = src;
  });
};

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError';
};

const getLegacyIconSource = async (linkId: string | undefined, url: string): Promise<string> => {
  const cacheId = linkId || url;
  if (!cacheId) {
    return '';
  }

  return await loadLegacyCachedFaviconSource(cacheId);
};

const getRemoteCandidates = (url: string, legacyIconSource: string): IconCandidate[] => {
  const candidates: IconCandidate[] = [];

  if (legacyIconSource) {
    candidates.push({ src: legacyIconSource, persistLocally: true });
  }

  try {
    const urlObj = new URL(url);
    const originSource = `${urlObj.origin}/favicon.ico`;
    const apiSource = `https://api.iowen.cn/favicon/${urlObj.hostname}.png`;

    if (!legacyIconSource || legacyIconSource !== originSource) {
      candidates.push({ src: originSource, persistLocally: true });
    }

    if (apiSource !== originSource && (!legacyIconSource || legacyIconSource !== apiSource)) {
      candidates.push({ src: apiSource, persistLocally: true });
    }
  } catch {
    return candidates;
  }

  return candidates;
};

// Ĭ��ͼ�����
const DefaultIcon: React.FC<{ title: string; size?: string; className?: string }> = ({
  title,
  size = 'w-6 h-6',
  className = '',
}) => {
  const normalizedTitle = title.trim();
  const firstChar = normalizedTitle ? normalizedTitle.charAt(0).toUpperCase() : '';
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const colorIndex = normalizedTitle ? (normalizedTitle.codePointAt(0) ?? 0) % colors.length : 0;
  const bgColor = colors[colorIndex];

  if (!firstChar) {
    return (
      <div
        className={`${size} ${className} rounded-lg flex items-center justify-center bg-slate-300/70 text-slate-700 dark:bg-slate-700/70 dark:text-slate-200`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-1/2 h-1/2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l1.92-1.92a5 5 0 0 0-7.07-7.07L11.3 5.63" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-1.92 1.92a5 5 0 0 0 7.07 7.07l1.08-1.08" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${size} ${className} ${bgColor} rounded-lg flex items-center justify-center text-white font-bold text-sm leading-none`}
    >
      {firstChar}
    </div>
  );
};

// ��վͼ�����
export const SiteIcon: React.FC<{
  url: string;
  title: string;
  linkId?: string;
  customIcon?: string;
  size?: string;
  className?: string;
}> = ({ url, title, linkId, customIcon, size = 'w-6 h-6', className = '' }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const applyLoadedSource = (src: string) => {
      if (!isMounted) {
        return;
      }
      setImgSrc(src);
      setStatus('loaded');
    };

    const loadSiteIcon = async () => {
      setStatus('loading');
      setImgSrc(null);

      if (customIcon) {
        if (customIcon.startsWith('data:image/')) {
          applyLoadedSource(customIcon);
          return;
        }

        try {
          await loadImage(customIcon, abortController.signal);
          applyLoadedSource(customIcon);
          return;
        } catch (error) {
          if (isAbortError(error)) {
            return;
          }
        }
      }

      const cachedIcon = await loadCachedFavicon(url);
      if (!isMounted) {
        return;
      }
      if (cachedIcon) {
        applyLoadedSource(cachedIcon);
        return;
      }

      const legacyIconSource = await getLegacyIconSource(linkId, url);
      if (!isMounted) {
        return;
      }
      if (legacyIconSource.startsWith('data:image/')) {
        applyLoadedSource(legacyIconSource);
        return;
      }

      const remoteCandidates = getRemoteCandidates(url, legacyIconSource);
      if (remoteCandidates.length === 0) {
        setStatus('error');
        return;
      }

      for (const candidate of remoteCandidates) {
        try {
          if (candidate.persistLocally) {
            const dataUrl = await fetchIconAsDataUrl(candidate.src, abortController.signal);
            await saveCachedFavicon(url, dataUrl);
            applyLoadedSource(dataUrl);
            return;
          }
        } catch (error) {
          if (isAbortError(error)) {
            return;
          }
        }

        try {
          await loadImage(candidate.src, abortController.signal);
          applyLoadedSource(candidate.src);
          return;
        } catch (error) {
          if (isAbortError(error)) {
            return;
          }
        }
      }

      if (isMounted) {
        setStatus('error');
      }
    };

    void loadSiteIcon();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [url, customIcon, linkId]);

  if (status === 'loading' || status === 'error') {
    return <DefaultIcon title={title} size={size} className={className} />;
  }

  return <img src={imgSrc || ''} alt={title} className={`${size} object-cover ${className}`} />;
};
