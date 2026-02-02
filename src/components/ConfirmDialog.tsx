import React, { useEffect, useState } from 'react';
import type { Theme } from '../constants';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    theme: Theme;
    onClose: () => void;
    onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    theme,
    onClose,
    onConfirm,
}) => {
    const isLight = theme === 'light';
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const bgClass = isLight ? 'bg-white' : 'bg-gray-900';
    const borderClass = isLight ? 'border-gray-200' : 'border-gray-700';
    const textClass = isLight ? 'text-gray-900' : 'text-white';
    const mutedClass = isLight ? 'text-gray-500' : 'text-gray-400';

    return (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-sm ${bgClass} border ${borderClass} rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="p-6 space-y-4">
                    <h3 className={`text-lg font-semibold ${textClass}`}>{title}</h3>
                    <p className={`text-sm ${mutedClass}`}>{message}</p>
                </div>

                <div className={`flex justify-end gap-3 p-4 border-t ${borderClass} bg-opacity-50`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${mutedClass} hover:${textClass} transition-colors`}
                    >
                        取消
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-500/20"
                    >
                        删除
                    </button>
                </div>
            </div>
        </div>
    );
};
