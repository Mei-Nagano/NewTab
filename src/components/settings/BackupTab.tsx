import React from 'react';
import type { AppSettings } from '../../constants';

interface BackupTabProps {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    status: { type: string; message: string };
    onBackup: () => void;
    onRestore: () => void;
    onExport: () => void;
    onImport: () => void;
    theme: 'light' | 'dark';
}

export const BackupTab: React.FC<BackupTabProps> = ({ settings, setSettings, status, onBackup, onRestore, onExport, onImport, theme }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Cloud Backup Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>WebDAV 云同步</h4>
                    </div>
                    {status.message && (
                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold animate-scale-in flex items-center gap-2 ${status.type === 'error'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${status.type === 'error' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                            {status.message}
                        </div>
                    )}
                </div>

                <div className={`p-8 rounded-3xl border transition-all ${theme === 'light' ? 'bg-gray-50/50 border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>服务器地址</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="https://dav.example.com/..."
                                    value={settings.webdav.url}
                                    onChange={(e) => setSettings(s => ({ ...s, webdav: { ...s.webdav, url: e.target.value } }))}
                                    className={`w-full border rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all ${theme === 'light'
                                        ? 'bg-white border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-gray-900 placeholder-gray-400'
                                        : 'bg-black/20 border-white/5 focus:border-blue-500/50 text-white placeholder-gray-600'
                                        }`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>用户名</label>
                                <input
                                    type="text"
                                    placeholder="请输入用户名"
                                    value={settings.webdav.username}
                                    onChange={(e) => setSettings(s => ({ ...s, webdav: { ...s.webdav, username: e.target.value } }))}
                                    className={`w-full border rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all ${theme === 'light'
                                        ? 'bg-white border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-gray-900'
                                        : 'bg-black/20 border-white/5 focus:border-blue-500/50 text-white'
                                        }`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>密码</label>
                                <input
                                    type="password"
                                    placeholder="请输入密码"
                                    value={settings.webdav.password}
                                    onChange={(e) => setSettings(s => ({ ...s, webdav: { ...s.webdav, password: e.target.value } }))}
                                    className={`w-full border rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all ${theme === 'light'
                                        ? 'bg-white border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-gray-900'
                                        : 'bg-black/20 border-white/5 focus:border-blue-500/50 text-white'
                                        }`}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={onBackup}
                                className={`flex-1 group px-6 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-3 ${theme === 'light'
                                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/20 hover:-translate-y-1'
                                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/20 hover:-translate-y-1'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-bounce"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                立即备份到云端
                            </button>
                            <button
                                onClick={onRestore}
                                className={`flex-1 group px-6 py-4 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-3 ${theme === 'light'
                                        ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-200'
                                        : 'bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-500"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                从云端恢复设置
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Local Backup Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>本地管理</h4>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <button
                        onClick={onExport}
                        className={`p-6 rounded-3xl border text-left transition-all group ${theme === 'light'
                                ? 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5'
                                : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>备份当前</span>
                                <span className={`text-base font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>导出配置</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed pl-1 font-medium">将所有设置保存为 JSON 文件到本地</p>
                    </button>

                    <button
                        onClick={onImport}
                        className={`p-6 rounded-3xl border text-left transition-all group ${theme === 'light'
                                ? 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'
                                : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>恢复设置</span>
                                <span className={`text-base font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>导入配置</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed pl-1 font-medium">从本地 JSON 文件中快速还原配置</p>
                    </button>
                </div>
            </section>
        </div>
    );
};