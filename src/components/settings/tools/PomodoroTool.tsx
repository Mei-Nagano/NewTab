import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { getCommonStyles } from './shared';
import { type AppSettings, type PomodoroSettings, DEFAULT_POMODORO } from '../../../constants';

interface ToolProps {
    theme: 'light' | 'dark';
    backgroundImage?: string;
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

export const PomodoroTool: React.FC<ToolProps> = ({ theme, backgroundImage, settings, onSettingsChange }) => {
    const pomodoroSettings = settings.pomodoro || DEFAULT_POMODORO;
    
    const [pomodoroTime, setPomodoroTime] = useState(pomodoroSettings.workDuration * 60);
    const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false);
    const [pomodoroMode, setPomodoroMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [pomodoroFullscreen, setPomodoroFullscreen] = useState(false);
    
    // Derived state/local state for the UI, but synchronized with settings
    const soundEnabled = pomodoroSettings.soundEnabled;
    const pomodoroTransparentBg = pomodoroSettings.transparentBg;
    const pomodoroDurations = {
        work: pomodoroSettings.workDuration,
        shortBreak: pomodoroSettings.shortBreakDuration,
        longBreak: pomodoroSettings.longBreakDuration
    };

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const styles = getCommonStyles(theme);

    const updatePomodoroSettings = (updates: Partial<PomodoroSettings>) => {
        onSettingsChange({
            ...settings,
            pomodoro: {
                ...pomodoroSettings,
                ...updates
            }
        });
    };

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('sounds/bell.wav');
    }, []);

    useEffect(() => {
        let interval: any;
        if (pomodoroIsRunning && pomodoroTime > 0) {
            interval = setInterval(() => {
                setPomodoroTime((prev) => prev - 1);
            }, 1000);
        } else if (pomodoroTime === 0) {
            setPomodoroIsRunning(false);
            if (soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
        return () => clearInterval(interval);
    }, [pomodoroIsRunning, pomodoroTime, soundEnabled]);

    // Handle ESC to exit fullscreen
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPomodoroFullscreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePomodoroReset = () => {
        setPomodoroIsRunning(false);
        setPomodoroTime(pomodoroDurations[pomodoroMode] * 60);
    };

    const togglePomodoro = () => setPomodoroIsRunning(!pomodoroIsRunning);
    const toggleFullscreen = () => setPomodoroFullscreen(!pomodoroFullscreen);

    return (
        <section>
            <div className={styles.sectionTitleClass}>
                <div className={`${styles.sectionDotClass} bg-rose-500`} />
                <h4 className={styles.sectionHeadingClass}>番茄时钟</h4>
            </div>
            <div className={styles.cardClass}>
                <div className="flex flex-col items-center py-8">
                    {/* Mode Selector */}
                    <div className={`flex w-full max-w-sm mx-auto p-1 rounded-xl mb-8 ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                        {[
                            { id: 'work', label: '专注' },
                            { id: 'shortBreak', label: '短休息' },
                            { id: 'longBreak', label: '长休息' }
                        ].map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => {
                                    setPomodoroMode(mode.id as any);
                                    setPomodoroIsRunning(false);
                                    // Reset time based on current custom inputs
                                    setPomodoroTime(pomodoroDurations[mode.id as keyof typeof pomodoroDurations] * 60);
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${pomodoroMode === mode.id
                                    ? (theme === 'light' ? 'bg-white text-rose-500 shadow-sm' : 'bg-white/10 text-white')
                                    : 'text-gray-400 hover:text-gray-500'}`}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <div className="relative mb-8 group cursor-pointer" onClick={() => {
                        // Allow editing time by clicking? Maybe later. For now just display.
                    }}>
                        <div className={`text-8xl font-mono font-bold tracking-tighter transition-colors ${pomodoroIsRunning
                            ? 'text-rose-500'
                            : (theme === 'light' ? 'text-gray-800' : 'text-gray-200')
                            }`}>
                            {formatTime(pomodoroTime)}
                        </div>
                        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {pomodoroIsRunning ? 'RUNNING' : 'PAUSED'}
                        </div>
                    </div>

                    {/* Custom Duration Input (Only visible when paused) */}
                    {!pomodoroIsRunning && (
                        <div className="mb-8 flex items-center gap-2">
                            <span className="text-xs text-gray-500">设置当前模式时长(分):</span>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={pomodoroDurations[pomodoroMode] || ''}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    const fieldName = pomodoroMode === 'work' ? 'workDuration' : 
                                                    pomodoroMode === 'shortBreak' ? 'shortBreakDuration' : 
                                                    'longBreakDuration';
                                    updatePomodoroSettings({ [fieldName]: val });
                                    setPomodoroTime(val * 60);
                                }}
                                className={`w-16 p-1 text-center text-sm rounded-lg border outline-none focus:ring-2 focus:ring-rose-500/20 ${
                                    theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10 text-white'
                                }`}
                            />
                        </div>
                    )}

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => updatePomodoroSettings({ soundEnabled: !soundEnabled })}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${theme === 'light'
                                    ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                    } ${soundEnabled ? '' : 'opacity-50'}`}
                                title={soundEnabled ? "关闭提示音" : "开启提示音"}
                            >
                                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </button>
                            <button
                                onClick={toggleFullscreen}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${theme === 'light'
                                ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                }`}
                            title="全屏专注模式"
                        >
                            <Maximize2 size={20} />
                        </button>
                        <button
                            onClick={togglePomodoro}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${pomodoroIsRunning
                                ? (theme === 'light' ? 'bg-white border-2 border-gray-100 text-gray-500 hover:text-rose-500' : 'bg-white/10 text-gray-300 hover:text-white')
                                : 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600'
                                }`}
                        >
                            {pomodoroIsRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>
                        <button
                            onClick={handlePomodoroReset}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${theme === 'light'
                                ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                }`}
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Fullscreen Pomodoro Overlay */}
            {pomodoroFullscreen && createPortal(
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-fade-in transition-all duration-500 overflow-hidden bg-black">
                    {backgroundImage && (
                        <div 
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${pomodoroTransparentBg ? 'opacity-100' : 'opacity-0'}`}
                            style={{ backgroundImage: `url(${backgroundImage})` }}
                        />
                    )}
                    {/* Blur Overlay - No dark mask as requested */}
                    <div className={`absolute inset-0 transition-all duration-700 ${pomodoroTransparentBg ? 'backdrop-blur-md' : ''}`} />
                    
                    <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
                        <div className="absolute top-8 right-8 flex gap-4">
                            <button
                                onClick={() => updatePomodoroSettings({ soundEnabled: !soundEnabled })}
                                className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md"
                                title={soundEnabled ? "关闭提示音" : "开启提示音"}
                            >
                                {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                            </button>
                            <button
                                onClick={() => updatePomodoroSettings({ transparentBg: !pomodoroTransparentBg })}
                                className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md"
                                title={pomodoroTransparentBg ? "切换纯色背景" : "显示壁纸背景"}
                            >
                                {pomodoroTransparentBg ? <div className="w-6 h-6 border-2 border-white rounded opacity-50" /> : <div className="w-6 h-6 bg-white rounded opacity-50" />}
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md"
                                title="退出全屏"
                            >
                                <Minimize2 size={24} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div className="text-[15rem] leading-none font-bold text-white tracking-tighter drop-shadow-2xl font-mono select-none">
                                {formatTime(pomodoroTime)}
                            </div>
                            <div className="text-2xl font-medium text-white/60 uppercase tracking-[1em] mt-4 mb-16 select-none">
                                {pomodoroIsRunning ? 'Focusing' : 'Paused'}
                            </div>
                            
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={togglePomodoro}
                                    className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-rose-500/30"
                                >
                                    {pomodoroIsRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                                </button>
                                
                                <button
                                    onClick={handlePomodoroReset}
                                    className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md"
                                >
                                    <RotateCcw size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};
