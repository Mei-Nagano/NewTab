import React, { useState, useEffect } from 'react';
import type { Theme } from '../../../constants';

interface GroupEditDialogProps {
    isOpen: boolean;
    groupId: string;
    currentTitle: string;
    theme: Theme;
    onClose: () => void;
    onSave: (groupId: string, newTitle: string) => void;
}

export const GroupEditDialog: React.FC<GroupEditDialogProps> = ({
    isOpen,
    groupId,
    currentTitle,
    theme,
    onClose,
    onSave,
}) => {
    const [title, setTitle] = useState(currentTitle);
    const isLight = theme === 'light';

    useEffect(() => {
        setTitle(currentTitle);
    }, [currentTitle]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) return;
        onSave(groupId, title.trim());
        onClose();
    };

    const bgClass = isLight ? 'bg-white' : 'bg-gray-900';
    const borderClass = isLight ? 'border-gray-200' : 'border-gray-700';
    const textClass = isLight ? 'text-gray-900' : 'text-white';
    const mutedClass = isLight ? 'text-gray-500' : 'text-gray-400';
    const inputClass = isLight
        ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
        : 'bg-gray-800 border-gray-700 text-white focus:border-blue-500';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="关闭编辑分组弹窗"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-sm ${bgClass} border ${borderClass} rounded-2xl shadow-2xl overflow-hidden animate-slide-up`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
                    <h3 className={`text-lg font-semibold ${textClass}`}>修改分组名</h3>
                    <button onClick={onClose} className={`${mutedClass} hover:${textClass} transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="group-title-input" className={`text-sm font-medium ${mutedClass}`}>分组名称</label>
                        <input
                            id="group-title-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-colors ${inputClass}`}
                            placeholder="输入分组名称"
                            autoFocus
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
                        disabled={!title.trim()}
                        className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${title.trim()
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
