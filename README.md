# 代码块快捷插入

> [!NOTE] 中文说明
> **代码块快捷插入**：快捷插入 Markdown 代码块，光标自动定位到块内，支持选中文本一键包裹、多语言独立命令与系统原生快捷键配置。

快捷插入 Markdown 代码块，光标自动定位到块内。选中文本一键包裹，为每个语言注册独立命令，快捷键在 Obsidian 系统快捷键设置中配置，替代 Templater 的代码块模板，无需 Templater 依赖。

> English description below for review purposes. / 以下为英文说明，用于过审。

Quickly insert Markdown code blocks with automatic cursor positioning. Wrap selected text with one command, one independent command per language, hotkeys configured in Obsidian's native Hotkeys settings. Replaces Templater code block templates without dependency.

## 功能特性

- **快捷插入代码块**：插入 ` ```lang ` 代码块，光标自动定位到块内空行，直接开始写代码
- **选中文本包裹**：选中一段文字，触发命令，自动用代码块包裹（保留原有缩进）
- **独立语言命令**：在设置中添加语言，每个语言注册独立命令，可分别绑定快捷键（默认内置 python / shell / yaml / json）
- **语言选择弹窗**：「插入代码块（选择语言）」命令弹出列表点选，未配置语言时插入无语言代码块
- **系统原生快捷键**：设置面板一键「打开设置快捷键」，自动定位到系统快捷键设置页对应命令，冲突由系统原生提示
- **智能换行**：光标前后有内容时自动处理换行，不会粘连到已有文字

### Features

- Quick code block insertion with auto cursor positioning
- Selected text wrapping (indentation preserved)
- One independent command per language added in settings (built-in defaults: python, shell, yaml, json), each bindable to its own hotkey
- Language picker modal for easy selection (falls back to a plain code block when no language is configured)
- Native hotkey settings integration: one click to open and locate the command; conflicts are flagged by Obsidian itself
- Smart line break handling

## 安装

### 方式一：从 Obsidian 社区目录安装(推荐)

1. 打开 Obsidian 设置 → 社区插件
2. 点击"浏览"，搜索 "XU Quick CodeBlock"
3. 点击"安装"，然后"启用"

### 方式二：手动安装

1. 从 [最新 Release](https://github.com/xcloud-ai/quick-codeblock/releases) 下载 `main.js`、`manifest.json`、`styles.css` 三个文件
2. 在 vault 中创建目录 `.obsidian/plugins/quick-codeblock/`
3. 将三个文件放入该目录
4. 打开 Obsidian 设置 → 社区插件，找到 "XU Quick CodeBlock" 并开启

### Installation

**From Obsidian Community Directory:**
1. Open Obsidian Settings → Community Plugins
2. Click "Browse" and search for "XU Quick CodeBlock"
3. Click "Install", then "Enable"

**Manual Installation:**
1. Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/xcloud-ai/quick-codeblock/releases)
2. Put them in `<vault>/.obsidian/plugins/quick-codeblock/`
3. Enable in Settings → Community Plugins

## 使用方法

### 插入代码块

1. `Ctrl+P` 打开命令面板，搜索「插入代码块」
2. 选择对应语言的命令（如「插入代码块（python）」），或用「插入代码块（选择语言）」弹窗点选
3. 无选中文本时：插入空代码块，光标自动定位到块内
4. 有选中文本时：用 ` ```lang ` 包裹选中的内容

### 配置快捷键

1. 打开插件设置（设置 → 社区插件 → XU Quick CodeBlock → 选项）
2. 在「快捷键」区域点击右上角 **+**，输入语言名（如 `python`）
3. 点击该语言对应的「打开设置快捷键」，自动跳转到 Obsidian 快捷键设置页，并搜索定位到「XU Quick CodeBlock: 插入代码块（python）」
4. 点击该命令行右侧的 **+** 录制快捷键即可（重复快捷键系统会原生提示冲突）
5. 不需要的语言点击 🗑 删除

### Usage

1. Press `Ctrl+P` to open the command palette and search for "Insert code block"
2. Select the language command (e.g. "Insert code block (python)"), or use "Insert code block (pick language)" to choose from a modal
3. Without selection: inserts an empty code block with the cursor inside
4. With selection: wraps the selected text with ` ```lang `

### Hotkey Configuration

1. Open plugin settings (Settings → Community Plugins → XU Quick CodeBlock → Options)
2. Click **+** in the "Hotkeys" section and type a language name (e.g. `python`)
3. Click "Open hotkey settings" next to it — Obsidian's native hotkeys page opens with "XU Quick CodeBlock: Insert code block (python)" located in the search box
4. Click **+** on that command row and record the hotkey (duplicates are flagged natively by Obsidian)
5. Click 🗑 to delete languages you don't need

## 替代 Templater

如果你之前用 Templater 的代码块模板（如 `codepython.md`），本插件完全覆盖该功能：

| | Templater | 本插件 |
|---|---|---|
| 依赖 | 需要 Templater 插件 | 无依赖 |
| 插入 ```python + 光标定位 | `tp.file.cursor()` | 自动计算行号定位 |
| 多语言 | 要写多个模板 | 一个插件搞定 |
| 选中文本包裹 | 不支持 | 支持 |
| 快捷键管理 | 不支持 | 系统原生快捷键设置，冲突原生提示 |

## 设置说明

| 设置项 | 说明 |
|--------|------|
| 快捷键 | 点击 **+** 添加语言，每个语言注册独立命令；输入语言名后点「打开设置快捷键」一键跳转系统快捷键设置页并定位到对应命令 |
| 使用文档 | GitHub 仓库链接，查看完整使用说明 |

## 命令列表

| 命令 | 作用 |
|------|------|
| 插入代码块（选择语言） | 弹出列表选择语言（未配置语言时插入无语言代码块） |
| 插入代码块（python） | 设置中添加的每个语言都会注册一个独立命令，可分别绑定快捷键 |

## 技术说明

- 纯 JavaScript 实现（`main.js`），无需编译，直接可用
- `main.ts` 为 TypeScript 源码参考，供二次开发使用
- 快捷键由 Obsidian 原生快捷键系统（`hotkeys.json`）持久化；旧版 data.json 自定义快捷键在启动时自动迁移到原生配置
- 兼容移动端（`isDesktopOnly: false`）

## 许可证

MIT License - Copyright (c) 2026 旭说云原生
