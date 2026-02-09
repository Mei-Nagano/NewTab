import React, { useState, useEffect } from 'react';

interface ToolsTabProps {
    theme: 'light' | 'dark';
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ theme }) => {
    const [activeTool, setActiveTool] = useState<'base64' | 'timestamp' | 'json'>('base64');

    // Base64 State
    const [base64Input, setBase64Input] = useState('');
    const [base64Output, setBase64Output] = useState('');
    const [base64Error, setBase64Error] = useState('');

    // Timestamp State
    const [currentTimestamp, setCurrentTimestamp] = useState(() => Math.floor(Date.now() / 1000));
    const [tsInput, setTsInput] = useState('');
    const [tsOutput, setTsOutput] = useState('');

    // JSON State
    const [jsonInput, setJsonInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [jsonFormatMode, setJsonFormatMode] = useState<'pretty' | 'minified'>('pretty');

    // Update current timestamp
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Base64 Logic
    const handleBase64Encode = () => {
        try {
            setBase64Output(btoa(unescape(encodeURIComponent(base64Input))));
            setBase64Error('');
        } catch {
            setBase64Error('编码失败：包含无效字符');
        }
    };

    const handleBase64Decode = () => {
        try {
            setBase64Output(decodeURIComponent(escape(atob(base64Input))));
            setBase64Error('');
        } catch {
            setBase64Error('解码失败：无效的 Base64 字符串');
        }
    };

    // Timestamp Logic
    const formatTimestamp = (ts: number) => {
        try {
            const date = new Date(ts * 1000);
            return date.toLocaleString();
        } catch {
            return '无效的时间戳';
        }
    };

    const handleTsConvert = () => {
        const ts = parseInt(tsInput);
        if (isNaN(ts)) {
            setTsOutput('请输入有效的时间戳');
            return;
        }
        setTsOutput(formatTimestamp(ts));
    };

    const handleDateToTs = () => {
        try {
            const date = new Date(tsInput);
            if (isNaN(date.getTime())) {
                setTsOutput('请输入有效的日期字符串');
                return;
            }
            setTsOutput(Math.floor(date.getTime() / 1000).toString());
        } catch {
            setTsOutput('转换失败');
        }
    };

    // JSON Logic
    const handleJsonFormat = () => {
        try {
            const obj = JSON.parse(jsonInput);
            if (jsonFormatMode === 'pretty') {
                setJsonOutput(JSON.stringify(obj, null, 4));
            } else {
                setJsonOutput(JSON.stringify(obj));
            }
            setJsonError('');
        } catch (e: unknown) {
            setJsonError(`格式化失败：${e instanceof Error ? e.message : String(e)}`);
            setJsonOutput('');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    const sectionTitleClass = `flex items-center gap-2 px-1 mb-4`;
    const sectionDotClass = `w-1 h-4 rounded-full`;
    const sectionHeadingClass = `text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`;
    const cardClass = `p-5 rounded-2xl border transition-all ${theme === 'light' ? 'bg-gray-50/50 border-gray-100' : 'bg-white/5 border-white/5'}`;
    const textareaClass = `w-full p-4 rounded-2xl border text-sm font-mono outline-none transition-all resize-none shadow-sm custom-scrollbar ${theme === 'light' 
        ? 'bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder-gray-300' 
        : 'bg-black/20 border-white/5 focus:border-blue-500/50 text-white placeholder-gray-600'}`;
    const buttonClass = `px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${theme === 'light'
        ? 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 shadow-sm'
        : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5'}`;
    const primaryButtonClass = `px-6 py-2.5 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95`;

    const toolTabs = [
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
    ];

    return (
        <div className="space-y-6 pb-4">
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    background: ${theme === 'light' ? '#e5e7eb' : '#3f3f46'};
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${theme === 'light' ? '#d1d5db' : '#52525b'};
                }
                `}
            </style>
            {/* Tool Selector - Optimized Card Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {toolTabs.map(tab => {
                    const isActive = activeTool === tab.id;
                    const colorStyles = {
                        blue: { light: 'bg-blue-50 border-blue-200 text-blue-600 shadow-blue-500/10', dark: 'bg-blue-500/15 border-blue-500/30 text-blue-400 shadow-blue-500/20', iconBg: 'bg-blue-500' },
                        orange: { light: 'bg-orange-50 border-orange-200 text-orange-600 shadow-orange-500/10', dark: 'bg-orange-500/15 border-orange-500/30 text-orange-400 shadow-orange-500/20', iconBg: 'bg-orange-500' },
                        emerald: { light: 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-emerald-500/10', dark: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20', iconBg: 'bg-emerald-500' },
                    };
                    const colorMap = colorStyles[tab.color as keyof typeof colorStyles];

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTool(tab.id)}
                            className={`relative group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left ${isActive
                                ? (theme === 'light' ? `${colorMap.light} shadow-lg` : `${colorMap.dark} shadow-lg`)
                                : (theme === 'light' ? 'bg-gray-50/50 border-gray-200 hover:bg-gray-100 hover:border-gray-300' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10')
                                }`}
                        >
                            {/* Icon Container */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                                ? (theme === 'light' ? 'bg-white shadow-md' : 'bg-white/10')
                                : (theme === 'light' ? 'bg-gray-200/50 group-hover:bg-gray-200' : 'bg-white/5 group-hover:bg-white/10')
                                }`}>
                                <span className={isActive
                                    ? (theme === 'light' ? colorMap.iconBg.replace('bg-', 'text-') : colorMap.iconBg.replace('bg-', 'text-'))
                                    : (theme === 'light' ? 'text-gray-500' : 'text-gray-400')
                                }>
                                    {tab.icon}
                                </span>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <div className={`font-bold text-sm transition-colors ${isActive
                                    ? (theme === 'light' ? 'text-gray-900' : 'text-white')
                                    : (theme === 'light' ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-300 group-hover:text-white')
                                }`}>
                                    {tab.label}
                                </div>
                                <div className={`text-xs mt-0.5 transition-colors ${isActive
                                    ? (theme === 'light' ? 'text-gray-600' : 'text-gray-400')
                                    : (theme === 'light' ? 'text-gray-400 group-hover:text-gray-500' : 'text-gray-500 group-hover:text-gray-400')
                                }`}>
                                    {tab.description}
                                </div>
                            </div>


                        </button>
                    );
                })}
            </div>

            <div className="animate-fade-in">
                {/* 1. Base64 Tool */}
                {activeTool === 'base64' && (
                    <section>
                        <div className={sectionTitleClass}>
                            <div className={`${sectionDotClass} bg-blue-500`} />
                            <h4 className={sectionHeadingClass}>Base64 转换</h4>
                        </div>
                        <div className={cardClass}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 ml-1">输入</label>
                                    <textarea
                                        value={base64Input}
                                        onChange={(e) => setBase64Input(e.target.value)}
                                        className={`${textareaClass} h-40`}
                                        placeholder="输入要编码或解码的内容..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 ml-1">输出</label>
                                    <textarea
                                        readOnly
                                        value={base64Output}
                                        className={`${textareaClass} h-40 bg-transparent`}
                                        placeholder="转换结果将显示在这里..."
                                    />
                                </div>
                            </div>
                            {base64Error && <p className="text-red-500 text-xs mt-2 ml-1">{base64Error}</p>}
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleBase64Encode} className={primaryButtonClass}>
                                    Base64 编码
                                </button>
                                <button onClick={handleBase64Decode} className={buttonClass}>
                                    Base64 解码
                                </button>
                                {base64Output && (
                                    <button onClick={() => copyToClipboard(base64Output)} className={buttonClass}>
                                        复制结果
                                    </button>
                                )}
                                <button onClick={() => { setBase64Input(''); setBase64Output(''); setBase64Error(''); }} className={buttonClass}>
                                    清空
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. Timestamp Tool */}
                {activeTool === 'timestamp' && (
                    <section>
                        <div className={sectionTitleClass}>
                            <div className={`${sectionDotClass} bg-orange-500`} />
                            <h4 className={sectionHeadingClass}>时间戳工具</h4>
                        </div>
                        <div className={cardClass}>
                            <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 font-medium">当前 Unix 时间戳 (秒)</span>
                                    <div className="text-2xl font-mono font-bold text-orange-500 tracking-wider">
                                        {currentTimestamp}
                                    </div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(currentTimestamp.toString())}
                                    className={buttonClass}
                                >
                                    复制
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 ml-1">转换工具</label>
                                    <input
                                        type="text"
                                        value={tsInput}
                                        onChange={(e) => setTsInput(e.target.value)}
                                        className={textareaClass}
                                        placeholder="输入时间戳或日期字符串..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 ml-1">结果</label>
                                    <div className="relative">
                                        <input
                                            readOnly
                                            value={tsOutput}
                                            className={`${textareaClass} bg-transparent`}
                                            placeholder="转换结果..."
                                        />
                                        {tsOutput && (
                                            <button
                                                onClick={() => copyToClipboard(tsOutput)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleTsConvert} className={primaryButtonClass}>
                                    时间戳 转 日期
                                </button>
                                <button onClick={handleDateToTs} className={buttonClass}>
                                    日期 转 时间戳
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. JSON Tool */}
                {activeTool === 'json' && (
                    <section>
                        <div className={sectionTitleClass}>
                            <div className={`${sectionDotClass} bg-emerald-500`} />
                            <h4 className={sectionHeadingClass}>JSON 格式化</h4>
                        </div>
                        <div className={cardClass}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-medium text-gray-500">JSON 内容</label>
                                        <div className={`flex p-0.5 rounded-lg border transition-all ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                                            <button 
                                                onClick={() => setJsonFormatMode('pretty')}
                                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${jsonFormatMode === 'pretty' 
                                                    ? (theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'bg-white/10 text-blue-400') 
                                                    : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                美化
                                            </button>
                                            <button 
                                                onClick={() => setJsonFormatMode('minified')}
                                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${jsonFormatMode === 'minified' 
                                                    ? (theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'bg-white/10 text-blue-400') 
                                                    : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                最简
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        className={`${textareaClass} h-32`}
                                        placeholder="在此粘贴 JSON 字符串进行格式化..."
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-medium text-gray-500">格式化结果</label>
                                    </div>
                                    <textarea
                                        readOnly
                                        value={jsonOutput}
                                        className={`${textareaClass} h-64 bg-transparent`}
                                        placeholder="格式化后的内容将显示在这里..."
                                    />
                                </div>
                            </div>
                            {jsonError && <p className="text-red-500 text-xs mt-2 ml-1">{jsonError}</p>}
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleJsonFormat} className={primaryButtonClass}>
                                    执行格式化
                                </button>
                                {jsonOutput && (
                                    <button onClick={() => copyToClipboard(jsonOutput)} className={buttonClass}>
                                        复制结果
                                    </button>
                                )}
                                <button onClick={() => { setJsonInput(''); setJsonOutput(''); setJsonError(''); }} className={buttonClass}>
                                    清空
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
