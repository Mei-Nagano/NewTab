import { useState, useEffect } from 'react';
import { Clock } from './components/Clock';
import { SearchBar } from './components/SearchBar';
import { LinkGrid } from './components/LinkGrid';
import { SettingsModal } from './components/SettingsModal';
import { ContextMenu, type ContextMenuState } from './components/ContextMenu';
import { LinkEditDialog } from './components/LinkEditDialog';
import { GroupEditDialog } from './components/GroupEditDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import { loadSettings, saveSettings, fetchBingWallpaper, fetchRandomWallpaper } from './utils/storage';
import { reorderLinksInGroup } from './utils/sortUtils';
import { type AppSettings, type Link, type HideOptions, DEFAULT_SETTINGS } from './constants';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [adaptiveTheme, setAdaptiveTheme] = useState<'light' | 'dark'>('dark');

  // 编辑模式状态
  const [isEditMode, setIsEditMode] = useState(false);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    type: 'blank',
  });

  // 链接编辑对话框状态
  const [editingLink, setEditingLink] = useState<{ link: Link; groupId: string } | null>(null);

  // 分组编辑对话框状态
  const [editingGroup, setEditingGroup] = useState<{ groupId: string; title: string } | null>(null);

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  // 初始化数据
  useEffect(() => {
    const init = async () => {
      try {
        const storedSettings = await loadSettings();
        if (!storedSettings.groups || storedSettings.groups.length === 0) {
          storedSettings.groups = DEFAULT_SETTINGS.groups;
        }
        setSettings(storedSettings);
        setAdaptiveTheme(storedSettings.theme);
      } catch (e) {
        console.error("加载设置失败", e);
        setSettings(DEFAULT_SETTINGS);
        setAdaptiveTheme(DEFAULT_SETTINGS.theme);
      } finally {
        setLoaded(true);
      }
    };
    init();
  }, []);

  // 处理背景图片逻辑
  useEffect(() => {
    let isMounted = true;

    const updateBackground = async () => {
      if (!loaded) return;

      let url = '';
      if (settings.bgType === 'custom' && settings.customBgUrl) {
        url = settings.customBgUrl;
      } else if (settings.bgType === 'random') {
        url = await fetchRandomWallpaper();
      } else {
        url = await fetchBingWallpaper();
      }

      if (isMounted) {
        setBackgroundImage(url);
      }
    };
    updateBackground();

    return () => {
      isMounted = false;
    };
  }, [settings.bgType, settings.customBgUrl, loaded]);

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // 处理链接拖拽排序
  const handleReorderLinks = async (groupId: string, activeId: string, overId: string) => {
    const newGroups = reorderLinksInGroup(settings.groups, groupId, activeId, overId);
    const newSettings = { ...settings, groups: newGroups };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // 处理分组折叠
  const handleToggleCollapse = async (groupId: string) => {
    const newGroups = settings.groups.map(g =>
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    );
    const newSettings = { ...settings, groups: newGroups };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // 处理主题切换
  const handleToggleTheme = () => {
    const newTheme = adaptiveTheme === 'light' ? 'dark' : 'light';
    setAdaptiveTheme(newTheme);
    handleSaveSettings({ ...settings, theme: newTheme });
  };

  // 同步全局主题类名到 html 元素
  useEffect(() => {
    if (adaptiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [adaptiveTheme]);

  // 处理链接右键菜单
  const handleLinkContextMenu = (e: React.MouseEvent, link: Link, groupId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'link',
      targetLink: link,
      targetGroupId: groupId,
    });
  };

  // 处理空白处右键菜单
  const handleBlankContextMenu = (e: React.MouseEvent) => {
    // 检查是否点击在链接上（由 LinkGrid 处理）
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('[data-link-item]')) {
      return;
    }
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'blank',
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // 打开链接编辑对话框
  const handleEditLink = (link: Link, groupId: string) => {
    setEditingLink({ link, groupId });
  };

  // 保存链接编辑
  const handleSaveLink = async (updatedLink: Link) => {
    if (!editingLink) return;

    const newGroups = settings.groups.map(g => {
      if (g.id !== editingLink.groupId) return g;
      return {
        ...g,
        links: g.links.map(l => l.id === updatedLink.id ? updatedLink : l)
      };
    });

    const newSettings = { ...settings, groups: newGroups };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setEditingLink(null);
  };

  // 切换隐藏选项
  const handleToggleHideOption = async (option: keyof HideOptions) => {
    const currentHideOptions = settings.hideOptions || {
      hideAllLinks: false,
      hideGroupNames: false,
      hideSearchBox: false,
      hideButtons: false,
      hideDate: false,
      hideClock: false,
    };

    const newHideOptions = {
      ...currentHideOptions,
      [option]: !currentHideOptions[option],
    };

    const newSettings = { ...settings, hideOptions: newHideOptions };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleToggleAllVisibility = async () => {
    const allHidden = settings.hideOptions?.hideAllLinks &&
      settings.hideOptions?.hideGroupNames &&
      settings.hideOptions?.hideSearchBox &&
      settings.hideOptions?.hideButtons &&
      settings.hideOptions?.hideDate &&
      settings.hideOptions?.hideClock;

    const newState = !allHidden;
    const newSettings = {
      ...settings,
      hideOptions: {
        hideAllLinks: newState,
        hideGroupNames: newState,
        hideSearchBox: newState,
        hideButtons: newState,
        hideDate: newState,
        hideClock: newState,
      }
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // 处理分组右键菜单
  const handleGroupContextMenu = (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    const group = settings.groups.find(g => g.id === groupId);
    if (!group) return;

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'group',
      targetGroupId: groupId,
    });
  };

  // 打开分组编辑对话框
  const handleEditGroup = (groupId: string) => {
    const group = settings.groups.find(g => g.id === groupId);
    if (!group) return;
    setEditingGroup({ groupId, title: group.title });
  };

  // 保存分组编辑
  const handleSaveGroup = async (groupId: string, newTitle: string) => {
    const newGroups = settings.groups.map(g =>
      g.id === groupId ? { ...g, title: newTitle } : g
    );

    const newSettings = { ...settings, groups: newGroups };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setEditingGroup(null);
  };

  const currentTheme = adaptiveTheme;

  if (!loaded) {
    return <div className="w-screen h-screen bg-gray-900" />;
  }

  const isLight = currentTheme === 'light';

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden bg-gray-900 font-sans ${!isLight ? 'dark' : ''}`}
      onContextMenu={handleBlankContextMenu}
    >
      {/* 背景层 */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          opacity: backgroundImage ? 1 : 0,
          filter: isLight
            ? `brightness(${settings.bgBlur ? 0.85 : 1.0}) contrast(1.0) blur(${settings.bgBlur ? (settings.bgBlurAmount || 8) + 'px' : '0px'})`
            : `brightness(${settings.bgBlur ? 0.5 : 0.65}) contrast(1.1) blur(${settings.bgBlur ? (settings.bgBlurAmount || 8) + 'px' : '0px'})`
        }}
      />

      {/* 夜间模式遮罩层 */}
      {!isLight && settings.enableDarkMask && (
        <div
          className={`absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ${backgroundImage ? 'bg-black/40' : 'bg-[#0f1115]'
            }`}
        />
      )}

      {/* 可滚动内容容器 */}
      <div className="absolute inset-0 z-10 overflow-y-auto custom-scrollbar">
        <div className="min-h-full w-full flex flex-col items-center py-12">

          {/* 主内容区域 */}
          <div className="flex flex-col items-center gap-10 w-full max-w-6xl px-4 my-auto animate-fade-in">
            {!settings.hideOptions?.hideClock && (
              <div className="flex-shrink-0 flex flex-col items-center gap-8 w-full">
                <Clock
                  theme={currentTheme}
                  showDate={!settings.hideOptions?.hideDate}
                  showSeconds={settings.showSeconds}
                />
                {!settings.hideOptions?.hideSearchBox && (
                  <SearchBar
                    engine={settings.searchEngine}
                    onEngineChange={(engine) => handleSaveSettings({ ...settings, searchEngine: engine })}
                    theme={currentTheme}
                  />
                )}
              </div>
            )}

            {!settings.hideOptions?.hideAllLinks && (
              <LinkGrid
                groups={settings.groups || []}
                theme={currentTheme}
                isEditMode={isEditMode}
                onReorderLinks={handleReorderLinks}
                onLinkContextMenu={handleLinkContextMenu}
                onToggleCollapse={handleToggleCollapse}
                onGroupContextMenu={handleGroupContextMenu}
                forceHideGroupNames={settings.hideOptions?.hideGroupNames}
                onDeleteLink={(link, groupId) => {
                  setConfirmDialog({
                    isOpen: true,
                    title: '删除网站',
                    message: `确定要删除 "${link.title}" 吗？此操作无法撤销。`,
                    onConfirm: () => {
                      const newGroups = settings.groups.map(g =>
                        g.id === groupId ? { ...g, links: g.links.filter(l => l.id !== link.id) } : g
                      );
                      handleSaveSettings({ ...settings, groups: newGroups });
                    }
                  });
                }}
              />
            )}
          </div>

          {/* 底部间距 */}
          <div className="h-24 flex-shrink-0 w-full" />
        </div>
      </div>

      {/* 编辑模式指示器 */}
      {isEditMode && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full backdrop-blur-xl shadow-lg border animate-slide-down ${isLight
          ? 'bg-white/90 border-gray-200 text-gray-600'
          : 'bg-gray-900/90 border-gray-700 text-gray-300'
          }`}>
          <span className="text-sm font-medium">长按拖拽排序</span>
          <button
            onClick={() => setIsEditMode(false)}
            className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm active:scale-95 ${isLight
              ? 'bg-gray-900 text-white hover:bg-gray-700'
              : 'bg-white text-gray-900 hover:bg-gray-200'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            完成
          </button>
        </div>
      )}

      {/* 主题切换按钮 */}
      {!settings.hideOptions?.hideButtons && (
        <button
          onClick={handleToggleTheme}
          className={`absolute top-6 right-6 z-20 p-4 rounded-full backdrop-blur-xl transition-all duration-500 hover:scale-110 hover:rotate-180 border-2 shadow-2xl group ${isLight ? 'bg-white/70 hover:bg-white/90 text-orange-600 border-orange-200/50 shadow-orange-500/20' : 'bg-gray-900/70 hover:bg-gray-900/90 text-yellow-400 hover:text-yellow-300 border-yellow-500/30 shadow-yellow-500/20'}`}
          aria-label="切换主题"
          title={isLight ? '切换到夜间模式' : '切换到日间模式'}
        >
          {isLight ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>
      )}

      {/* 设置按钮 */}
      {!settings.hideOptions?.hideButtons && (
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`absolute bottom-6 left-6 z-20 p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:rotate-90 group border shadow-lg ${isLight ? 'bg-white/50 hover:bg-white/80 text-gray-700 hover:text-gray-900 border-white/20' : 'bg-black/20 hover:bg-black/40 text-white/70 hover:text-white border-white/5'}`}
          aria-label="设置"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      )}

      {/* 右键菜单 */}
      <ContextMenu
        state={contextMenu}
        theme={currentTheme}
        isEditMode={isEditMode}
        hideOptions={settings.hideOptions}
        onClose={closeContextMenu}
        onToggleTheme={handleToggleTheme}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onEditLink={handleEditLink}
        onDeleteLink={(link, groupId) => {
          setConfirmDialog({
            isOpen: true,
            title: '删除网站',
            message: `确定要删除 "${link.title}" 吗？此操作无法撤销。`,
            onConfirm: () => {
              const newGroups = settings.groups.map(g =>
                g.id === groupId ? { ...g, links: g.links.filter(l => l.id !== link.id) } : g
              );
              handleSaveSettings({ ...settings, groups: newGroups });
            }
          });
        }}
        onEditGroup={handleEditGroup}
        onToggleHideOption={handleToggleHideOption}
        onToggleAllVisibility={handleToggleAllVisibility}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 链接编辑对话框 */}
      {editingLink && (
        <LinkEditDialog
          isOpen={true}
          link={editingLink.link}
          theme={currentTheme}
          onClose={() => setEditingLink(null)}
          onSave={handleSaveLink}
        />
      )}

      {/* 分组编辑对话框 */}
      {editingGroup && (
        <GroupEditDialog
          isOpen={true}
          groupId={editingGroup.groupId}
          currentTitle={editingGroup.title}
          theme={currentTheme}
          onClose={() => setEditingGroup(null)}
          onSave={handleSaveGroup}
        />
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog?.isOpen || false}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        theme={currentTheme}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
      />

      {/* 设置弹窗 */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={handleSaveSettings}
          theme={currentTheme}
        />
      )}
    </div>
  );
}