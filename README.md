# 代码块快捷插入

快捷插入 Markdown 代码块，光标自动定位到块内。支持自定义语言、选中文本一键包裹、快捷键配置与冲突检测，替代 Templater 的代码块模板，无需 Templater 依赖。

> English description below for review purposes. / 以下为英文说明，用于过审。

Quickly insert Markdown code blocks with automatic cursor positioning. Supports custom languages, selected text wrapping, hotkey configuration and conflict detection. Replaces Templater code block templates without dependency.

## 功能特性

- **快捷插入代码块**：插入 ` ```lang ` 代码块，光标自动定位到块内空行，直接开始写代码
- **选中文本包裹**：选中一段文字，触发命令，自动用代码块包裹
- **自定义语言列表**：默认含 python / javascript / bash / shell / sql / json / yaml / go / rust / java / html / css，可自行增删
- **语言选择弹窗**：不想记快捷键？用「选择语言」命令弹出列表点选
- **快捷键自定义**：在插件设置面板里直接为需要的语言配置快捷键，无需去系统设置里翻
- **快捷键冲突检测**：设置快捷键时即时检测是否与其他命令冲突，冲突显示警告并提供跳转入口
- **智能换行**：光标前后有内容时自动处理换行，不会粘连到已有文字

### Features

- Quick code block insertion with auto cursor positioning
- Selected text wrapping with code block
- Custom language list (default: python, javascript, bash, shell, sql, json, yaml, go, rust, java, html, css)
- Language picker modal for easy selection
- Custom hotkey configuration in plugin settings
- Hotkey conflict detection with jump-to-settings link
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
2. 选择对应语言的命令（如「插入代码块（python）」）
3. 无选中文本时：插入空代码块，光标自动定位到块内
4. 有选中文本时：用 ` ```lang ` 包裹选中的内容

### 配置快捷键

1. 打开插件设置（设置 → 社区插件 → XU Quick CodeBlock → 选项）
2. 在「快捷键设置」区域，默认有一项（python）
3. 点击「+ 添加快捷键配置」增加新项
4. 每项可选择语言（dropdown）+ 设置快捷键 + 删除
5. 点击快捷键输入框，按下组合键即可设置；按 `Backspace` 或 `Esc` 清除
6. 设置后自动检测冲突，有冲突会显示红色警告和「前往修改」链接

### Usage

1. Press `Ctrl+P` to open command palette, search for "Insert code block"
2. Select the language command (e.g. "Insert code block (python)")
3. Without selection: inserts empty code block with cursor inside
4. With selection: wraps selected text with ` ```lang `

### Hotkey Configuration

1. Open plugin settings (Settings → Community Plugins → XU Quick CodeBlock → Options)
2. Default has one item (python), click "+ Add" to add more
3. Each item: select language (dropdown) + set hotkey + delete
4. Click hotkey input, press key combination to set; press `Backspace` or `Esc` to clear
5. Auto conflict detection with red warning and "Go to settings" link

## 替代 Templater

如果你之前用 Templater 的代码块模板（如 `codepython.md`），本插件完全覆盖该功能：

| | Templater | 本插件 |
|---|---|---|
| 依赖 | 需要 Templater 插件 | 无依赖 |
| 插入 ```python + 光标定位 | `tp.file.cursor()` | 自动计算行号定位 |
| 多语言 | 要写多个模板 | 一个插件搞定 |
| 选中文本包裹 | 不支持 | 支持 |
| 快捷键管理 | 不支持 | 内置配置 + 冲突检测 |

## 设置说明

| 设置项 | 说明 |
|--------|------|
| 默认语言 | 主命令「插入代码块」使用的语言 |
| 语言列表 | 每行一个，为每个语言注册独立命令 |
| 保留选中内容缩进 | 选中文本包裹时是否保留原有缩进 |
| 快捷键设置 | 为需要的语言配置快捷键（默认一项，可自行添加） |

## 命令列表

| 命令 | 作用 |
|------|------|
| 插入代码块（python） | 主命令，用默认语言 |
| 插入代码块（选择语言） | 弹出列表选择语言 |
| 插入代码块（javascript） | 每个预设语言各一个命令 |
| ... | 语言列表里的每个语言都会注册 |

## 技术说明

- 纯 JavaScript 实现（`main.js`），无需编译，直接可用
- `main.ts` 为 TypeScript 源码参考，供二次开发使用
- 快捷键通过 `hotkeyManager.setHotkeys` 绑定，与 Obsidian 系统快捷键互通
- 卸载插件时自动清除快捷键绑定，保持 `hotkeys.json` 干净

## 许可证

MIT License - Copyright (c) 2026 旭说云原生
