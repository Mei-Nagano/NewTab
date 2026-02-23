import React, { useState, useEffect } from 'react';

// 默认图标组件
const DefaultIcon: React.FC<{ title: string; size?: string }> = ({ title, size = "w-6 h-6" }) => {
    const firstChar = title ? title.charAt(0).toUpperCase() : '?';
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = title ? title.charCodeAt(0) % colors.length : 0;
    const bgColor = colors[colorIndex];

    return (
        <div className={`${size} ${bgColor} rounded-lg flex items-center justify-center text-white font-bold text-sm leading-none`}>
            {firstChar}
        </div>
    );
};

// 网站图标组件
export const SiteIcon: React.FC<{
    url: string;
    title: string;
    linkId?: string;
    customIcon?: string;
    size?: string;
    className?: string;
}> = ({ url, title, linkId, customIcon, size = "w-6 h-6", className = "" }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let currentImg: HTMLImageElement | null = null;

        setStatus('loading');
        setImgSrc(null);

        const getSources = () => {
            const sources: string[] = [];
            if (customIcon) sources.push(customIcon);

            const cacheKey = `newtab_fav_${linkId || url}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached && cached !== customIcon) sources.push(cached);

            try {
                const urlObj = new URL(url);
                const hostname = urlObj.hostname;
                const apiSource = `https://api.iowen.cn/favicon/${hostname}.png`;
                if (apiSource !== cached) sources.push(apiSource);
                const originSource = `${urlObj.origin}/favicon.ico`;
                if (originSource !== cached && originSource !== apiSource) sources.push(originSource);
            } catch { /* invalid URL */ }

            return sources;
        };

        const sources = getSources();
        if (sources.length === 0) {
            setStatus('error');
            return;
        }

        const attemptLoad = (index: number) => {
            if (!isMounted || index >= sources.length) {
                if (isMounted) setStatus('error');
                return;
            }
            const img = new Image();
            currentImg = img;
            img.src = sources[index];
            img.onload = () => {
                if (!isMounted) return;
                setImgSrc(sources[index]);
                setStatus('loaded');
                if (sources[index] !== customIcon) {
                    const cacheKey = `newtab_fav_${linkId || url}`;
                    localStorage.setItem(cacheKey, sources[index]);
                }
            };
            img.onerror = () => {
                if (isMounted) attemptLoad(index + 1);
            };
        };

        attemptLoad(0);

        return () => {
            isMounted = false;
            if (currentImg) {
                currentImg.onload = null;
                currentImg.onerror = null;
                currentImg = null;
            }
        };
    }, [url, customIcon, linkId]);

    if (status === 'loading' || status === 'error') {
        return <DefaultIcon title={title} size={size} />;
    }

    return (
        <img
            src={imgSrc!}
            alt={title}
            className={`${size} object-cover ${className}`}
        />
    );
};
