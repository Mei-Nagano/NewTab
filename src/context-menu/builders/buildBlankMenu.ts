import type { MenuItem } from '@/components/ContextMenu/types';
import type { BlankMenuBuilderContext } from './types';

const buildHideOptionsChildren = ({
  hideOptions,
  onToggleHideOption,
  onToggleAllVisibility,
}: Pick<BlankMenuBuilderContext, 'hideOptions' | 'onToggleHideOption' | 'onToggleAllVisibility'>): MenuItem[] => {
  return [
    { id: 'hc', label: '隐藏时钟', checked: hideOptions?.hideClock, onClick: () => onToggleHideOption?.('hideClock') },
    { id: 'hd', label: '隐藏日期', checked: hideOptions?.hideDate, onClick: () => onToggleHideOption?.('hideDate') },
    { id: 'hal', label: '隐藏所有链接', checked: hideOptions?.hideAllLinks, onClick: () => onToggleHideOption?.('hideAllLinks') },
    { id: 'hgn', label: '隐藏分组名称', checked: hideOptions?.hideGroupNames, onClick: () => onToggleHideOption?.('hideGroupNames') },
    { id: 'hsb', label: '隐藏搜索框', checked: hideOptions?.hideSearchBox, onClick: () => onToggleHideOption?.('hideSearchBox') },
    { id: 'hb', label: '隐藏按钮', checked: hideOptions?.hideButtons, onClick: () => onToggleHideOption?.('hideButtons') },
    { id: 'sep-all', type: 'separator', label: '' },
    {
      id: 'toggle-all',
      label: '一键隐藏/显示全部',
      onClick: onToggleAllVisibility,
    },
  ];
};

export const buildBlankMenu = (context: BlankMenuBuilderContext): MenuItem[] => {
  const {
    isLight,
    isEditMode,
    hideOptions,
    onToggleTheme,
    onSaveWallpaper,
    onToggleEditMode,
    onOpenSettings,
    onToggleHideOption,
    onToggleAllVisibility,
  } = context;

  return [
    {
      id: 'theme',
      label: isLight ? '切换到夜间模式' : '切换到日间模式',
      onClick: onToggleTheme,
    },
    { id: 'sep-theme', type: 'separator', label: '' },
    {
      id: 'save-wallpaper',
      label: '保存当前壁纸',
      onClick: onSaveWallpaper,
    },
    { id: 'sep1', type: 'separator', label: '' },
    {
      id: 'edit-mode',
      label: isEditMode ? '关闭编辑模式' : '开启编辑模式',
      onClick: onToggleEditMode,
    },
    { id: 'sep2', type: 'separator', label: '' },
    {
      id: 'settings',
      label: '设置',
      onClick: onOpenSettings,
    },
    { id: 'sep3', type: 'separator', label: '' },
    {
      id: 'hide-options',
      label: '隐藏选项',
      children: buildHideOptionsChildren({
        hideOptions,
        onToggleHideOption,
        onToggleAllVisibility,
      }),
    },
  ];
};
