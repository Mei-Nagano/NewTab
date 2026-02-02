import React, { useRef } from 'react';
import type { AppSettings } from '../../constants';

interface GeneralTabProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    onClearCache: () => void;
    cacheClearStatus: string;
    theme: 'light' | 'dark';
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ settings, onSettingsChange, onClearCache, cacheClearStatus, theme }) => {
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = React.useState(false);
    const searchDropdownRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('图片文件太大（超过 5MB），请选择较小的图片。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onSettingsChange({ ...settings, customBgUrl: dataUrl });
        };
        reader.readAsDataURL(file);
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setIsSearchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchEngines = [
        { value: 'google', label: 'Google 谷歌搜索', icon: 'https://www.google.com/favicon.ico' },
        { value: 'bing', label: 'Bing 微软必应', icon: 'https://www.bing.com/favicon.ico' },
        { value: 'baidu', label: 'Baidu 百度搜索', icon: 'https://www.baidu.com/favicon.ico' },
    ] as const;

    const bgTypes = [
        { value: 'bing', label: '必应每日', desc: '每天更新一张精选壁纸', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> },
        { value: 'random', label: '随机风景', desc: '海量精选风景图库', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13h2l2-5h4l2 8h2l2-3h2"></path></svg> },
        { value: 'custom', label: '自定义', desc: '上传或输入图片链接', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> },
    ] as const;

    return (
        <div className="space-y-8 pb-4">
            {/* 1. Background Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>背景与视觉</h4>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {bgTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => onSettingsChange({ ...settings, bgType: type.value })}
                            className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 text-center ${settings.bgType === type.value
                                ? (theme === 'light' ? 'bg-blue-50/50 border-blue-500 shadow-md shadow-blue-500/10' : 'bg-blue-500/10 border-blue-500 text-blue-400')
                                : (theme === 'light' ? 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]')
                                }`}
                        >
                            <div className={`p-3 rounded-2xl transition-all duration-300 ${settings.bgType === type.value
                                ? (theme === 'light' ? 'bg-blue-500 text-white scale-110' : 'bg-blue-500 text-white scale-110')
                                : (theme === 'light' ? 'bg-gray-100 text-gray-500 group-hover:bg-gray-200' : 'bg-white/10 text-gray-400 group-hover:bg-white/20')
                                }`}>
                                {type.icon}
                            </div>
                            <div className="space-y-1">
                                <span className={`block text-sm font-bold ${settings.bgType === type.value ? (theme === 'light' ? 'text-blue-600' : 'text-blue-400') : (theme === 'light' ? 'text-gray-900' : 'text-gray-200')}`}>
                                    {type.label}
                                </span>
                                <span className="text-[11px] text-gray-500 leading-tight">
                                    {type.desc}
                                </span>
                            </div>
                            {settings.bgType === type.value && (
                                <div className="absolute top-3 right-3 animate-scale-in">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {settings.bgType === 'custom' && (
                    <div className="animate-fade-in pl-1 space-y-3">
                        <div className="relative group flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="输入图片 URL (https://...)"
                                    value={settings.customBgUrl?.startsWith('data:') ? '本地上传图片' : settings.customBgUrl}
                                    onChange={(e) => onSettingsChange({ ...settings, customBgUrl: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none ${theme === 'light'
                                        ? 'bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-900'
                                        : 'bg-black/20 border-white/5 focus:bg-black/40 focus:border-blue-500/50 text-white placeholder-gray-600'
                                        } ${settings.customBgUrl?.startsWith('data:') ? 'italic text-gray-400' : ''}`}
                                    readOnly={settings.customBgUrl?.startsWith('data:')}
                                />
                                {settings.customBgUrl && (
                                    <button
                                        onClick={() => onSettingsChange({ ...settings, customBgUrl: '' })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 transition-colors"
                                        title="清除"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-bold transition-all flex-shrink-0 ${theme === 'light'
                                    ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 shadow-lg shadow-black/20'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <span>上传本地图片</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                        <p className={`text-[11px] px-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                            支持 JPG、PNG、WebP 等格式。上传的图片将保存在本地浏览器存储中。
                        </p>
                    </div>
                )}

                <div className={`flex flex-col p-4 px-5 rounded-2xl border transition-all ${theme === 'light' ? 'bg-gray-50/50 border-gray-100 hover:border-gray-200' : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>背景模糊效果</span>
                                {settings.bgBlur && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${theme === 'light' ? 'bg-gray-200 text-gray-600' : 'bg-white/10 text-gray-300'}`}>
                                        {settings.bgBlurAmount || 8}px
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">开启后背景图片将添加高级磨砂玻璃感</span>
                        </div>
                        <button
                            onClick={() => onSettingsChange({ ...settings, bgBlur: !settings.bgBlur })}
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none border-2 flex-shrink-0 ${settings.bgBlur
                                ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-500/10'
                                : (theme === 'light' ? 'bg-gray-200 border-gray-300 shadow-inner' : 'bg-white/10 border-white/5')
                                }`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ${settings.bgBlur ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {settings.bgBlur && (
                        <div className="pt-2 pb-1 animate-slide-down">
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={settings.bgBlurAmount || 8}
                                onChange={(e) => onSettingsChange({ ...settings, bgBlurAmount: parseInt(e.target.value) })}
                                className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${theme === 'light' ? 'bg-gray-200' : 'bg-white/20'
                                    } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110`}
                            />
                            <div className={`flex justify-between mt-1 text-[10px] font-medium ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span>清晰</span>
                                <span>模糊</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex items-center justify-between p-4 px-5 rounded-2xl border transition-all ${theme === 'light' ? 'bg-gray-50/50 border-gray-100 hover:border-gray-200' : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}>
                    <div className="flex flex-col gap-0.5">
                        <span className={`text-sm font-bold ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>时钟显示秒数</span>
                        <span className="text-xs text-gray-500 font-medium">开启后时钟将实时显示秒数</span>
                    </div>
                    <button
                        onClick={() => onSettingsChange({ ...settings, showSeconds: !settings.showSeconds })}
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none border-2 ${settings.showSeconds
                            ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-500/10'
                            : (theme === 'light' ? 'bg-gray-200 border-gray-300 shadow-inner' : 'bg-white/10 border-white/5')
                            }`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ${settings.showSeconds ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </section>

            {/* 2. Interface Elements Section (MOVED UP) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-purple-500 rounded-full" />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>显示开关</h4>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { key: 'hideClock', label: '数字时钟', inverse: true },
                        { key: 'hideDate', label: '当前日期', inverse: true },
                        { key: 'hideSearchBox', label: '快捷搜索框', inverse: true },
                        { key: 'hideAllLinks', label: '所有网页链接', inverse: true },
                        { key: 'hideGroupNames', label: '分组名称', inverse: true },
                        { key: 'hideButtons', label: '功能按钮', inverse: true },
                    ].map(({ key, label, inverse }) => {
                        const rawValue = settings.hideOptions?.[key as keyof typeof settings.hideOptions] || false;
                        const isOn = inverse ? !rawValue : rawValue;

                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    const current = settings.hideOptions || {
                                        hideAllLinks: false,
                                        hideGroupNames: false,
                                        hideSearchBox: false,
                                        hideButtons: false,
                                        hideDate: false,
                                        hideClock: false,
                                    };
                                    onSettingsChange({
                                        ...settings,
                                        hideOptions: {
                                            ...current,
                                            [key]: inverse ? isOn : !isOn
                                        }
                                    });
                                }}
                                className={`p-4 px-5 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between group ${theme === 'light'
                                    ? (isOn ? 'bg-white border-blue-100 text-gray-900 shadow-sm shadow-blue-500/5' : 'bg-gray-100/60 border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-white')
                                    : (isOn ? 'bg-blue-500/10 border-blue-500/30 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-400')
                                    }`}
                            >
                                <span className="transition-colors">{label}</span>
                                <div className={`relative w-9 h-5 rounded-full transition-all duration-300 border ${isOn
                                    ? 'bg-blue-500 border-blue-500'
                                    : (theme === 'light' ? 'bg-gray-200 border-gray-300 shadow-inner' : 'bg-white/10 border-white/5')
                                    }`}>
                                    <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ${isOn ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => {
                        const allHidden = settings.hideOptions?.hideAllLinks &&
                            settings.hideOptions?.hideGroupNames &&
                            settings.hideOptions?.hideSearchBox &&
                            settings.hideOptions?.hideButtons &&
                            settings.hideOptions?.hideDate &&
                            settings.hideOptions?.hideClock;

                        const newState = !allHidden;
                        onSettingsChange({
                            ...settings,
                            hideOptions: {
                                hideAllLinks: newState,
                                hideGroupNames: newState,
                                hideSearchBox: newState,
                                hideButtons: newState,
                                hideDate: newState,
                                hideClock: newState,
                            }
                        });
                    }}
                    className={`w-full mt-2 p-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${theme === 'light'
                        ? 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200 hover:text-gray-900'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-white'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    <span>快速切换一键显隐</span>
                </button>
            </section>

            {/* 3. Search Engine Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-orange-500 rounded-full" />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>搜索工具</h4>
                </div>

                <div className="relative" ref={searchDropdownRef}>
                    <button
                        onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                        className={`w-full group px-5 py-4 rounded-2xl border flex items-center justify-between outline-none transition-all ${theme === 'light'
                            ? 'bg-gray-50/50 border-gray-100 text-gray-900 hover:bg-gray-50 hover:border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                            : 'bg-white/5 border-white/5 text-white hover:bg-white/[0.08] hover:border-white/10 focus:border-blue-500/50'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${theme === 'light' ? 'bg-white' : 'bg-black/20'}`}>
                                <img
                                    src={searchEngines.find(e => e.value === settings.searchEngine)?.icon}
                                    alt=""
                                    className="w-5 h-5 rounded-sm shadow-sm"
                                />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>默认引擎</span>
                                <span className="text-sm font-bold">
                                    {searchEngines.find(e => e.value === settings.searchEngine)?.label || '选择搜索引擎'}
                                </span>
                            </div>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20" height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`text-gray-400 transition-transform duration-300 ${isSearchDropdownOpen ? 'rotate-180 text-blue-500' : ''}`}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {isSearchDropdownOpen && (
                        <div className={`absolute top-full left-0 right-0 mt-2 z-50 border rounded-2xl shadow-2xl overflow-hidden animate-scale-in origin-top ${theme === 'light'
                            ? 'bg-white border-gray-200'
                            : 'bg-[#1a1b1e] border-white/10'
                            }`}>
                            <div className="p-1.5 space-y-0.5">
                                {searchEngines.map(engine => (
                                    <button
                                        key={engine.value}
                                        onClick={() => {
                                            onSettingsChange({ ...settings, searchEngine: engine.value });
                                            setIsSearchDropdownOpen(false);
                                        }}
                                        className={`w-full group text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center justify-between ${settings.searchEngine === engine.value
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : (theme === 'light' ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/5 hover:text-white')
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={engine.icon}
                                                alt=""
                                                className={`w-4 h-4 rounded-sm ${settings.searchEngine === engine.value ? 'brightness-0 invert' : ''}`}
                                            />
                                            <span className="font-bold">{engine.label}</span>
                                        </div>
                                        {settings.searchEngine === engine.value && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. Storage Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>数据与缓存</h4>
                </div>

                <div className={`flex items-center justify-between p-4 px-5 border rounded-2xl transition-all group ${theme === 'light'
                    ? 'bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-sm'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}>
                    <div className="flex flex-col gap-0.5">
                        <span className={`text-sm font-bold ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>清理站点图标</span>
                        <span className="text-xs text-gray-500 font-medium">重置已保存的 Favicon 缓存</span>
                    </div>
                    <button
                        onClick={onClearCache}
                        disabled={!!cacheClearStatus}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light'
                            ? 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/5 hover:border-white/20'
                            }`}
                    >
                        {cacheClearStatus ? (
                            <span className="text-emerald-500 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                已清理
                            </span>
                        ) : '立即清理'}
                    </button>
                </div>
            </section>
        </div>
    );
};