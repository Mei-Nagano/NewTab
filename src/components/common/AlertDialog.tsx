import React, { useEffect, useState } from 'react';

interface AlertDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    theme: 'light' | 'dark';
    onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
    isOpen,
    title,
    message,
    theme,
    onClose,
}) => {
    const isLight = theme === 'light';
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
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
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className={`text-xl font-bold tracking-tight ${textClass}`}>{title}</h3>
                            <p className={`text-[14px] leading-relaxed font-medium ${mutedClass}`}>{message}</p>
                        </div>
                    </div>
                </div>

                <div className={`p-6 pt-0`}>
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]"
                    >
                        知道了
                    </button>
                </div>
            </div>
        </div>
    );
};
