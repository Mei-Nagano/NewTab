# ✨ NewTab - 美观且极简的新标签页

<div align="center">
  <img src="public/icons/icon128.png" alt="NewTab Logo" width="128" height="128" />
  
  <p>
    一款美观、高度可定制且无干扰的 Chrome 新标签页扩展。
    <br />
    旨在为您的浏览体验带来平静与专注。
  </p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
</div>

## 🎨 功能特性

- **极简设计**：清爽的界面，带有磨砂玻璃（背景模糊）效果。
- **高质量壁纸**：
    - 🔄 **每日 Bing 壁纸**：自动同步每日精美图片。
    - 🔗 **自定义 URL**：使用任意图片 URL 作为背景。
    - 💧 **模糊控制**：调节背景模糊度以提高文字可读性。
- **智能链接管理**：
    - 📁 **分组**：将您喜爱的网站整理到不同的标签/分组中。
    - 🖱️ **拖放排序**：轻松重新排列链接和分组（由 `dnd-kit` 驱动）。
    - 📌 **书签导入**：一键从浏览器书签导入（仅限扩展程序模式）。
- **全能搜索**：即时切换 Google、Bing 和 百度搜索引擎。
- **同步**：跨设备同步您的设置。

## 🛠️ 技术栈

使用现代 Web 技术构建，兼顾性能与开发体验：

- **React 19**：用于构建 Web 和原生用户界面的最新库。
- **TypeScript**：提供类型安全的代码和更好的重构体验。
- **Vite**：闪电般的构建工具和开发服务器。
- **Tailwind CSS**：实用优先的 CSS 框架，用于快速 UI 开发。
- **dnd-kit**：轻量、高性能、无障碍的 React 拖放工具包。

## 🚀 快速开始

您可以选择直接下载安装使用，也可以克隆源码进行二次开发。

### 📥 方式一：直接安装（推荐用户）

如果您不打算修改代码，可以直接下载构建好的文件：

1.  **获取扩展程序**：
    前往 [Releases](https://github.com/Mei-Nagano/NewTab/releases) 页面下载最新发布的资源包 (`NewTab.zip`) 并解压。
2.  **安装到 Chrome**：
    1.  打开 Chrome 浏览器，访问 `chrome://extensions/`。
    2.  在右上角开启 **“开发者模式” (Developer mode)**。
    3.  点击 **“加载已解压的扩展程序” (Load unpacked)**。
    4.  选择 Releases 解压后的文件夹`NewTab`（或方式二中构建的 `dist` 文件夹）。
    5.  完成！打开新标签页即可体验。

### 💻 方式二：本地开发构建

如果您是开发者，想要修改功能或自行构建：

#### 1. 前置要求
- Node.js (推荐 v18 或更高版本)
- npm 或 yarn 或 pnpm

#### 2. 安装与启动
克隆仓库并安装依赖：

```bash
git clone https://github.com/Mei-Nagano/NewTab.git
cd NewTab
npm install
```

启动开发服务器（支持热更新）：

```bash
npm run dev
```

#### 3. 构建项目
构建生产环境代码（生成 `dist` 目录）：

```bash
npm run build
```

构建完成后，按照“方式一”中的步骤加载 `dist` 目录即可。

## 📂 项目结构

```text
NewTab/                      # 项目根目录
├── public/                  # 静态资源
│   ├── icons/               # 插件图标 (16px, 48px, 128px)
│   └── manifest.json        # 浏览器扩展清单文件
├── src/                     # 源代码
│   ├── components/          # React 组件
│   │   ├── settings/        # 设置面板子组件 (常规、链接、备份、关于)
│   │   ├── LinkGrid.tsx     # 链接网格主展示区域
│   │   ├── SearchBar.tsx    # 搜索框组件 (支持多种引擎)
│   │   ├── Clock.tsx        # 时钟与日期组件
│   │   └── ContextMenu.tsx  # 右键自定义菜单
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # 本地持久化与书签同步
│   │   ├── webdav.ts        # WebDAV 备份与恢复逻辑
│   │   └── update.ts        # 在线检查版本更新
│   ├── constants.ts         # 全局常量 (默认配置、版本号等)
│   ├── index.css            # 全局样式 (Tailwind CSS 指令)
│   ├── App.tsx              # 应用根组件，负责核心状态管理
│   └── main.tsx             # 应用入口文件
├── dist/                    # 生产构建输出 (Build 后生成)
└── package.json             # 项目元数据与脚本配置
```

## 🤝 贡献

欢迎提交 Pull Request 来贡献代码！

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。