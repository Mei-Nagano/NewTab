import React, { useState } from 'react';
import { QrCode, Timer } from 'lucide-react';
import type { AppSettings } from '@/constants';
import { Base64Tool } from './common/Base64Tool';
import { TimestampTool } from './common/TimestampTool';
import { JsonTool } from './common/JsonTool';
import { QrCodeTool } from './common/QrCodeTool';
import { PomodoroTool } from './pomodoro/PomodoroTool';

interface ToolsTabProps {
    theme: 'light' | 'dark';
    backgroundImage?: string;
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

type ToolId = 'base64' | 'timestamp' | 'json' | 'qrcode' | 'pomodoro';
type ToolColor = 'blue' | 'orange' | 'emerald' | 'purple' | 'rose';

interface ToolStyleMap {
    light: string;
    dark: string;
    iconBg: string;
}

interface ToolTabItem {
    id: ToolId;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: ToolColor;
}

const colorStyles: Record<ToolColor, ToolStyleMap> = {
    blue: { light: 'bg-blue-50 border-blue-200 text-blue-600 shadow-blue-500/10', dark: 'bg-blue-500/15 border-blue-500/30 text-blue-400 shadow-blue-500/20', iconBg: 'bg-blue-500' },
    orange: { light: 'bg-orange-50 border-orange-200 text-orange-600 shadow-orange-500/10', dark: 'bg-orange-500/15 border-orange-500/30 text-orange-400 shadow-orange-500/20', iconBg: 'bg-orange-500' },
    emerald: { light: 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-emerald-500/10', dark: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20', iconBg: 'bg-emerald-500' },
    purple: { light: 'bg-purple-50 border-purple-200 text-purple-600 shadow-purple-500/10', dark: 'bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-purple-500/20', iconBg: 'bg-purple-500' },
    rose: { light: 'bg-rose-50 border-rose-200 text-rose-600 shadow-rose-500/10', dark: 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/20', iconBg: 'bg-rose-500' },
};

function getCardClass(theme: 'light' | 'dark', isActive: boolean, colorMap: ToolStyleMap): string {
    if (isActive) {
        const activeBase = theme === 'light' ? colorMap.light : colorMap.dark;
        return `${activeBase} shadow-lg`;
    }
    if (theme === 'light') {
        return 'bg-gray-50/50 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
    }
    return 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10';
}

function getIconContainerClass(theme: 'light' | 'dark', isActive: boolean): string {
    if (isActive) {
        return theme === 'light' ? 'bg-white shadow-md' : 'bg-white/10';
    }
    return theme === 'light' ? 'bg-gray-200/50 group-hover:bg-gray-200' : 'bg-white/5 group-hover:bg-white/10';
}

function getIconClass(theme: 'light' | 'dark', isActive: boolean, colorMap: ToolStyleMap): string {
    if (isActive) return colorMap.iconBg.replace('bg-', 'text-');
    return theme === 'light' ? 'text-gray-500' : 'text-gray-400';
}

function getTitleClass(theme: 'light' | 'dark', isActive: boolean): string {
    if (isActive) return theme === 'light' ? 'text-gray-900' : 'text-white';
    return theme === 'light' ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-300 group-hover:text-white';
}

function getDescriptionClass(theme: 'light' | 'dark', isActive: boolean): string {
    if (isActive) return theme === 'light' ? 'text-gray-600' : 'text-gray-400';
    return theme === 'light' ? 'text-gray-400 group-hover:text-gray-500' : 'text-gray-500 group-hover:text-gray-400';
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ theme, backgroundImage, settings, onSettingsChange }) => {
    const [activeTool, setActiveTool] = useState<ToolId>('base64');

    const toolTabs: ToolTabItem[] = [
        {
            id: 'base64' as const,
            label: 'Base64 转换',
            description: '文本与 Base64 编码互转',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
            color: 'blue'
        },
        {
            id: 'timestamp' as const,
            label: '时间戳工具',
            description: 'Unix 时间戳与日期转换',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
            color: 'orange'
        },
        {
            id: 'json' as const,
            label: 'JSON 格式化',
            description: 'JSON 美化与压缩',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
            color: 'emerald'
        },
        {
            id: 'qrcode' as const,
            label: '二维码生成',
            description: '文本生成二维码图片',
            icon: <QrCode size={20} />,
            color: 'purple'
        },
        {
            id: 'pomodoro' as const,
            label: '番茄时钟',
            description: '专注工作与休息计时',
            icon: <Timer size={20} />,
            color: 'rose'
        },
    ];

    return (
        <div className="space-y-6 pb-4">
            <style>
                {`
                /* Hide number input spinners */
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                `}
            </style>
            
            {/* Tool Selector - Optimized Card Style */}
            <div className="grid grid-cols-3 gap-3">
                {toolTabs.map(tab => {
                    const isActive = activeTool === tab.id;
                    const colorMap = colorStyles[tab.color];

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTool(tab.id)}
                            className={`relative group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left ${getCardClass(theme, isActive, colorMap)}`}
                        >
                            {/* Icon Container */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${getIconContainerClass(theme, isActive)}`}>
                                <span className={getIconClass(theme, isActive, colorMap)}>
                                    {tab.icon}
                                </span>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <div className={`font-bold text-sm transition-colors ${getTitleClass(theme, isActive)}`}>
                                    {tab.label}
                                </div>
                                <div className={`text-xs mt-0.5 transition-colors ${getDescriptionClass(theme, isActive)}`}>
                                    {tab.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="animate-fade-in">
                {activeTool === 'base64' && <Base64Tool theme={theme} />}
                {activeTool === 'timestamp' && <TimestampTool theme={theme} />}
                {activeTool === 'json' && <JsonTool theme={theme} />}
                {activeTool === 'qrcode' && <QrCodeTool theme={theme} />}
                {activeTool === 'pomodoro' && (
                    <PomodoroTool 
                        theme={theme} 
                        backgroundImage={backgroundImage} 
                        settings={settings}
                        onSettingsChange={onSettingsChange}
                    />
                )}
            </div>
        </div>
    );
};
