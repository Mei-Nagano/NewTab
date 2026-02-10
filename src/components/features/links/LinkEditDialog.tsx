import React, { useState, useRef, useEffect } from 'react';
import type { Theme, Link } from '../../../constants';
import { SiteIcon } from '../../common/SiteIcon';

interface LinkEditDialogProps {
    isOpen: boolean;
    link: Link;
    theme: Theme;
    onClose: () => void;
    onSave: (updatedLink: Link) => void;
}



export const LinkEditDialog: React.FC<LinkEditDialogProps> = ({
    isOpen,
    link,
    theme,
    onClose,
    onSave,
}) => {
    const [title, setTitle] = useState(link.title);
    const [url, setUrl] = useState(link.url);
    const [icon, setIcon] = useState(link.icon || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isLight = theme === 'light';

    useEffect(() => {
        setTitle(link.title);
        setUrl(link.url);
        setIcon(link.icon || '');
    }, [link]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        // 验证文件大小 (最大 500KB)
        if (file.size > 500 * 1024) {
            alert('图片大小不能超过 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setIcon(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!title.trim() || !url.trim()) return;

        const finalUrl = url.startsWith('http') || url.startsWith('data:')
            ? url
            : `https://${url}`;

        onSave({
            ...link,
            title: title.trim(),
            url: finalUrl,
            icon: icon || undefined,
        });
        onClose();
    };

    const handleClearIcon = () => {
        setIcon('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const bgClass = isLight ? 'bg-white' : 'bg-gray-900';
    const borderClass = isLight ? 'border-gray-200' : 'border-gray-700';
    const textClass = isLight ? 'text-gray-900' : 'text-white';
    const mutedClass = isLight ? 'text-gray-500' : 'text-gray-400';
    const inputClass = isLight
        ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
        : 'bg-gray-800 border-gray-700 text-white focus:border-blue-500';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-sm ${bgClass} border ${borderClass} rounded-2xl shadow-2xl overflow-hidden animate-slide-up`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
                    <h3 className={`text-lg font-semibold ${textClass}`}>编辑网站</h3>
                    <button onClick={onClose} className={`${mutedClass} hover:${textClass} transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* 图标预览与上传 */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            <SiteIcon
                                url={url}
                                title={title}
                                customIcon={icon}
                                size="w-12 h-12"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full px-3 py-2 text-sm border ${borderClass} rounded-lg ${isLight ? 'hover:bg-gray-50' : 'hover:bg-gray-800'} transition-colors ${textClass}`}
                            >
                                上传图标
                            </button>
                            {icon && (
                                <button
                                    onClick={handleClearIcon}
                                    className={`w-full px-3 py-1.5 text-xs ${mutedClass} hover:text-red-400 transition-colors`}
                                >
                                    清除自定义图标
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 标题 */}
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium ${mutedClass}`}>标题</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-colors ${inputClass}`}
                            placeholder="网站标题"
                        />
                    </div>

                    {/* URL */}
                    <div className="space-y-1.5">
                        <label className={`text-sm font-medium ${mutedClass}`}>URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-colors ${inputClass}`}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex justify-end gap-3 p-4 border-t ${borderClass}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${mutedClass} hover:${textClass} transition-colors`}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || !url.trim()}
                        className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${title.trim() && url.trim()
                            ? 'bg-blue-600 hover:bg-blue-500'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};
