import React, { useState, useEffect, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableLinkItem } from './SortableLinkItem';
import { SiteIcon } from '../common/SiteIcon';
import { reorderItems } from '../../utils/sortUtils';
import type { AppSettings, Link, LinkGroup } from '../../constants';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { AlertDialog } from '../common/AlertDialog';

interface LinksTabProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    activeGroupId: string;
    setActiveGroupId: (id: string) => void;
    onStartImport: () => void;
    isFetchingBookmarks: boolean;
    theme: 'light' | 'dark';
}

const ALL_GROUP_ID = '__all__';
const ALL_GROUP_TITLE = '所有链接';

export const LinksTab: React.FC<LinksTabProps> = ({
    settings,
    onSettingsChange,
    activeGroupId,
    setActiveGroupId,
    onStartImport,
    isFetchingBookmarks,
    theme
}) => {
    // Local state
    const [newLink, setNewLink] = useState({ title: '', url: '', icon: '' });
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [editingGroupTitle, setEditingGroupTitle] = useState('');
    const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());

    // Dropdown state
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    const groupDropdownRef = useRef<HTMLDivElement>(null);

    // Dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const [alertDialog, setAlertDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
                setIsGroupDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const isAllGroupSelected = activeGroupId === ALL_GROUP_ID;
    const allGroupLinks = settings.groups.flatMap(group => group.links);
    const activeGroup = isAllGroupSelected
        ? { id: ALL_GROUP_ID, title: ALL_GROUP_TITLE, links: allGroupLinks }
        : (settings.groups.find(g => g.id === activeGroupId) || settings.groups[0]);

    useEffect(() => {
        if (activeGroup) {
            setEditingGroupTitle(isAllGroupSelected ? ALL_GROUP_TITLE : activeGroup.title);
            setSelectedLinkIds(new Set());
            setEditingLinkId(null);
            setNewLink({ title: '', url: '', icon: '' });
        }
    }, [activeGroup?.id, isAllGroupSelected]);

    // Group Handlers
    const addGroup = () => {
        const newGroup: LinkGroup = {
            id: `g-${Date.now()}`,
            title: '新分组',
            links: []
        };
        onSettingsChange({ ...settings, groups: [...settings.groups, newGroup] });
        setActiveGroupId(newGroup.id);
    };

    const deleteGroup = (id: string) => {
        if (id === ALL_GROUP_ID || isAllGroupSelected) {
            setAlertDialog({
                isOpen: true,
                title: '无法删除',
                message: '“所有链接”是默认分组视图，不能删除。'
            });
            return;
        }

        if (settings.groups.length <= 1) {
            setAlertDialog({
                isOpen: true,
                title: '无法删除',
                message: '至少需要保留一个分组。'
            });
            return;
        }

        const group = settings.groups.find(g => g.id === id);
        setConfirmDialog({
            isOpen: true,
            title: '删除分组',
            message: `确定要删除 "${group?.title || '此分组'}" 及其所有链接吗？此操作无法撤销。`,
            onConfirm: () => {
                const remaining = settings.groups.filter(g => g.id !== id);
                onSettingsChange({ ...settings, groups: remaining });
                if (id === activeGroupId) {
                    setActiveGroupId(remaining[0].id);
                }
            }
        });
    };

    const updateGroupTitle = (id: string, newTitle: string) => {
        if (id === ALL_GROUP_ID) return;
        onSettingsChange({
            ...settings,
            groups: settings.groups.map(g => g.id === id ? { ...g, title: newTitle } : g)
        });
    };

    // Link Handlers
    const handleLinkSubmit = () => {
        if (isAllGroupSelected) return;
        if (!newLink.title || !newLink.url) return;

        let url = newLink.url;
        if (!url.startsWith('http') && !url.startsWith('data:')) {
            url = `https://${url}`;
        }

        if (editingLinkId) {
            onSettingsChange({
                ...settings,
                groups: settings.groups.map(g =>
                    g.id === activeGroupId
                        ? { ...g, links: g.links.map(l => l.id === editingLinkId ? { ...l, title: newLink.title, url, icon: newLink.icon || undefined } : l) }
                        : g
                )
            });
            setEditingLinkId(null);
        } else {
            const link: Link = {
                id: Date.now().toString(),
                title: newLink.title,
                url,
                icon: newLink.icon || undefined
            };
            onSettingsChange({
                ...settings,
                groups: settings.groups.map(g =>
                    g.id === activeGroupId ? { ...g, links: [...g.links, link] } : g
                )
            });
        }
        setNewLink({ title: '', url: '', icon: '' });
    };

    const removeLink = (linkId: string) => {
        if (isAllGroupSelected) return;
        if (editingLinkId === linkId) {
            setNewLink({ title: '', url: '', icon: '' });
            setEditingLinkId(null);
        }
        onSettingsChange({
            ...settings,
            groups: settings.groups.map(g =>
                g.id === activeGroupId ? { ...g, links: g.links.filter(l => l.id !== linkId) } : g
            )
        });
    };

    const startEditLink = (link: Link) => {
        if (isAllGroupSelected) return;
        setNewLink({ title: link.title, url: link.url, icon: link.icon || '' });
        setEditingLinkId(link.id);
        // Scroll to form if needed
        document.getElementById('link-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const toggleLinkSelection = (id: string) => {
        const newSet = new Set(selectedLinkIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedLinkIds(newSet);
    };

    const deleteSelectedLinks = () => {
        if (isAllGroupSelected) return;
        if (selectedLinkIds.size === 0) return;

        setConfirmDialog({
            isOpen: true,
            title: '删除链接',
            message: `确定要删除 ${selectedLinkIds.size} 个选中的链接吗？此操作无法撤销。`,
            onConfirm: () => {
                onSettingsChange({
                    ...settings,
                    groups: settings.groups.map(g =>
                        g.id === activeGroupId
                            ? { ...g, links: g.links.filter(l => !selectedLinkIds.has(l.id)) }
                            : g
                    )
                });
                setSelectedLinkIds(new Set());
            }
        });
    };

    const handleLinkDragEnd = (event: DragEndEvent) => {
        if (isAllGroupSelected) return;
        const { active, over } = event;
        if (over && active.id !== over.id && activeGroupId) {
            onSettingsChange({
                ...settings,
                groups: settings.groups.map(g => {
                    if (g.id !== activeGroupId) return g;
                    return {
                        ...g,
                        links: reorderItems(g.links, active.id as string, over.id as string)
                    };
                })
            });
        }
    };

    const toggleSelectAllGroupLinks = () => {
        if (!activeGroup) return;
        if (isAllGroupSelected) return;
        if (selectedLinkIds.size === activeGroup.links.length && activeGroup.links.length > 0) {
            setSelectedLinkIds(new Set());
        } else {
            setSelectedLinkIds(new Set(activeGroup.links.map(l => l.id)));
        }
    };

    if (!activeGroup) return <div className="p-8 text-center text-gray-500">加载中...</div>;

    return (
        <div className="space-y-8 animate-fade-in">

            {/* 1. Group Management Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>分组管理</h4>
                </div>

                <div className={`p-6 rounded-3xl border transition-all ${theme === 'light' ? 'bg-gray-50/50 border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex flex-col gap-6">
                        {/* Row 1: Group Selector */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1" ref={groupDropdownRef}>
                                <button
                                    onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                                    className={`w-full group px-5 py-4 rounded-2xl border flex items-center justify-between outline-none transition-all ${theme === 'light'
                                        ? 'bg-white border-gray-100 text-gray-900 hover:border-blue-400 focus:border-blue-500'
                                        : 'bg-black/20 border-white/5 text-white hover:border-white/20 focus:border-blue-500/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-blue-50 text-blue-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">当前分组</span>
                                            <span className="text-sm font-bold">{activeGroup.title}</span>
                                        </div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform duration-300 ${isGroupDropdownOpen ? 'rotate-180 text-blue-500' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>

                                {isGroupDropdownOpen && (
                                    <div className={`absolute top-full left-0 right-0 mt-2 z-50 border rounded-2xl shadow-2xl overflow-hidden animate-scale-in origin-top ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1b1e] border-white/10'}`}>
                                        <div className="p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                                            <button
                                                onClick={() => {
                                                    setActiveGroupId(ALL_GROUP_ID);
                                                    setIsGroupDropdownOpen(false);
                                                }}
                                                className={`w-full group text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center justify-between ${isAllGroupSelected
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                    : (theme === 'light' ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/5 hover:text-white')
                                                    }`}
                                            >
                                                <span className="font-bold">{ALL_GROUP_TITLE}</span>
                                                <span className={`text-xs ${isAllGroupSelected ? 'text-white/90' : (theme === 'light' ? 'text-gray-400' : 'text-gray-500')}`}>
                                                    ({allGroupLinks.length})
                                                </span>
                                            </button>
                                            {settings.groups.map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => {
                                                        setActiveGroupId(g.id);
                                                        setIsGroupDropdownOpen(false);
                                                    }}
                                                    className={`w-full group text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center justify-between ${g.id === activeGroupId
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                        : (theme === 'light' ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/5 hover:text-white')
                                                        }`}
                                                >
                                                    <span className="font-bold">{g.title}</span>
                                                    {g.id === activeGroupId && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={addGroup} className={`p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`} title="新建分组">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                                <button onClick={() => deleteGroup(activeGroupId)} disabled={isAllGroupSelected} className={`p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-white border-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300'}`} title="删除当前分组">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Group Settings */}
                        <div className="flex items-center gap-4">
                            <div className={`flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${theme === 'light'
                                ? 'bg-white border-gray-100 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5'
                                : 'bg-black/20 border-white/5 focus-within:border-blue-500/50'
                                }`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <input
                                    value={editingGroupTitle}
                                    onChange={(e) => {
                                        setEditingGroupTitle(e.target.value);
                                        updateGroupTitle(activeGroupId, e.target.value);
                                    }}
                                    disabled={isAllGroupSelected}
                                    className={`flex-1 bg-transparent border-none p-0 text-sm font-bold outline-none placeholder-gray-500 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                                    placeholder="重命名分组..."
                                />
                            </div>

                            <button
                                onClick={onStartImport}
                                disabled={isFetchingBookmarks || isAllGroupSelected}
                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border flex items-center gap-2.5 ${theme === 'light'
                                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                                    : 'bg-white/10 text-white border-transparent hover:bg-white/20'
                                    }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                {isFetchingBookmarks ? '加载中...' : '导入书签'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Add / Edit Link Form */}
            <div className="space-y-4" id="link-form">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-orange-500 rounded-full" />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {editingLinkId ? '编辑链接' : '快速添加链接'}
                    </h4>
                </div>

                <div className={`p-6 rounded-3xl border transition-all ${editingLinkId
                    ? 'bg-amber-500/5 border-amber-500/20 ring-2 ring-amber-500/5'
                    : (theme === 'light' ? 'bg-gray-50/50 border-gray-100 shadow-sm' : 'bg-white/5 border-white/5')
                    }`}>
                    <div className="flex items-start gap-6">
                        {/* Icon Preview */}
                        <div className="flex-shrink-0 pt-1">
                            <label className={`group relative w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all ${theme === 'light'
                                ? 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
                                : 'bg-black/20 border-white/10 hover:border-blue-500/50 hover:bg-white/5'
                                }`}>
                                {(newLink.icon || newLink.url) ? (
                                    <div className="w-full h-full p-1">
                                        <SiteIcon
                                            url={newLink.url}
                                            title={newLink.title}
                                            linkId={editingLinkId || undefined}
                                            customIcon={newLink.icon}
                                            size="w-full h-full"
                                            className="rounded-xl"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 group-hover:text-blue-500"><path d="M12 5v14M5 12h14" /></svg>
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500">图标</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 512 * 1024) {
                                                alert('图片大小不能超过 512KB');
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                setNewLink(prev => ({ ...prev, icon: event.target?.result as string }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                            {newLink.icon && (
                                <button
                                    onClick={() => setNewLink(prev => ({ ...prev, icon: '' }))}
                                    className="mt-2 text-[11px] font-bold text-red-400 hover:text-red-500 w-full text-center transition-colors"
                                >
                                    移除
                                </button>
                            )}
                        </div>

                        {/* Form Inputs */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">网站标题</label>
                                    <input
                                        className={`w-full px-5 py-3 rounded-2xl border text-sm font-bold transition-all outline-none ${theme === 'light'
                                            ? 'bg-white border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-gray-900 placeholder-gray-400'
                                            : 'bg-black/20 border-white/5 focus:border-blue-500/50 text-white placeholder-gray-600'
                                            }`}
                                        placeholder="例如: GitHub"
                                        value={newLink.title}
                                        onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">链接 URL</label>
                                    <input
                                        className={`w-full px-5 py-3 rounded-2xl border text-sm font-bold transition-all outline-none ${theme === 'light'
                                            ? 'bg-white border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-gray-900 placeholder-gray-400'
                                            : 'bg-black/20 border-white/5 focus:border-blue-500/50 text-white placeholder-gray-600'
                                            }`}
                                        placeholder="github.com"
                                        value={newLink.url}
                                        onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                {editingLinkId ? (
                                    <>
                                        <button onClick={() => { setEditingLinkId(null); setNewLink({ title: '', url: '', icon: '' }); }} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${theme === 'light' ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-white/5'}`}>
                                            取消
                                        </button>
                                        <button onClick={handleLinkSubmit} className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all">
                                            完成修改
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleLinkSubmit}
                                        disabled={isAllGroupSelected || !newLink.title || !newLink.url}
                                        className={`px-10 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 ${(isAllGroupSelected || !newLink.title || !newLink.url)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:-translate-y-0.5'}`}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        添加至当前分组
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Link List Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                        <h4 className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>链接列表</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'}`}>
                            {activeGroup.links.length}
                        </span>
                    </div>

                    {activeGroup.links.length > 0 && !editingLinkId && !isAllGroupSelected && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <button
                                onClick={toggleSelectAllGroupLinks}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${selectedLinkIds.size === activeGroup.links.length
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : (theme === 'light' ? 'bg-white border-gray-200 text-gray-600 hover:border-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')
                                    }`}
                            >
                                {selectedLinkIds.size === activeGroup.links.length ? '取消全选' : '选择全部'}
                            </button>

                            {selectedLinkIds.size > 0 && (
                                <button
                                    onClick={deleteSelectedLinks}
                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[11px] font-bold border border-red-500/20 transition-all flex items-center gap-1.5"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    删除选中 ({selectedLinkIds.size})
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleLinkDragEnd}
                    >
                        <SortableContext
                            items={activeGroup.links.map(l => l.id)}
                            strategy={rectSortingStrategy}
                        >
                            {activeGroup.links.length === 0 ? (
                                <div className={`text-center py-12 rounded-3xl border border-dashed flex flex-col items-center gap-3 ${theme === 'light' ? 'border-gray-200 bg-gray-50/30' : 'border-white/10 bg-white/5'}`}>
                                    <div className="p-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-500">当前分组暂无链接，请在上方添加</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {activeGroup.links.map(link => (
                                        <SortableLinkItem
                                            key={link.id}
                                            link={link}
                                            isEditing={editingLinkId === link.id}
                                            isSelected={selectedLinkIds.has(link.id)}
                                            onSelect={() => toggleLinkSelection(link.id)}
                                            onEdit={() => startEditLink(link)}
                                            onDelete={() => removeLink(link.id)}
                                            theme={theme}
                                        />
                                    ))}
                                </div>
                            )}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                theme={theme === 'light' ? 'light' : 'dark'}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
            />

            <AlertDialog
                isOpen={alertDialog.isOpen}
                title={alertDialog.title}
                message={alertDialog.message}
                theme={theme === 'light' ? 'light' : 'dark'}
                onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
