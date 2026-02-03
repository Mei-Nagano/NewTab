import React, { useEffect, useState } from 'react';
import type { Theme } from '../constants';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    theme: Theme;
    confirmText?: string;
    onClose: () => void;
    onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    theme,
    confirmText = '确定删除',
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

    const bgClass = isLight ? 'bg-white/90' : 'bg-[#1a1b1e]/90';
    const borderClass = isLight ? 'border-gray-200' : 'border-white/10';
    const textClass = isLight ? 'text-gray-900' : 'text-white';
    const mutedClass = isLight ? 'text-gray-500' : 'text-gray-400';

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-[360px] ${bgClass} backdrop-blur-md border ${borderClass} rounded-[28px] shadow-2xl overflow-hidden transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}`}>
                <div className="p-8 space-y-5">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isLight ? 'bg-red-50 text-red-500' : 'bg-red-500/10 text-red-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className={`text-xl font-bold tracking-tight ${textClass}`}>{title}</h3>
                            <p className={`text-[14px] leading-relaxed font-medium ${mutedClass}`}>{message}</p>
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col gap-2 p-6 pt-0`}>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-full py-4 text-[15px] font-bold text-white bg-red-500 hover:bg-red-400 rounded-2xl transition-all shadow-lg shadow-red-500/25 active:scale-[0.98]"
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className={`w-full py-3.5 text-[14px] font-bold ${mutedClass} hover:${textClass} rounded-2xl transition-all active:scale-[0.98]`}
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};
