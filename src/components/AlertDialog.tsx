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
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-sm ${bgClass} backdrop-blur-md border ${borderClass} rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <h3 className={`text-lg font-semibold ${textClass}`}>{title}</h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${mutedClass}`}>{message}</p>
                </div>

                <div className={`flex justify-end p-4 border-t ${borderClass} bg-black/5`}>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
                    >
                        知道了
                    </button>
                </div>
            </div>
        </div>
    );
};
