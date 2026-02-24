import React from 'react';

interface SettingSectionProps {
    title: string;
    theme: 'light' | 'dark';
    children: React.ReactNode;
    headerAction?: React.ReactNode;
    description?: string;
    accentColor?: string;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
    title,
    theme,
    children,
    headerAction,
    description,
    accentColor = 'bg-blue-500',
}) => {
    const isLight = theme === 'light';

    return (
        <section className={`space-y-4 animate-fade-in ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 ${accentColor} rounded-full transition-all duration-300`} />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {title}
                    </h4>
                </div>
                {headerAction}
            </div>

            <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 ${isLight
                ? 'bg-gray-50/50 border-gray-100 shadow-sm'
                : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                }`}>
                {description && (
                    <p className={`text-xs mb-6 -mt-2 leading-relaxed font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {description}
                    </p>
                )}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </section>
    );
};
