# Quick CodeBlock

Quickly insert Markdown code blocks with automatic cursor positioning inside the block. Supports custom languages, selection wrapping, hotkey configuration with real-time conflict detection.

A drop-in replacement for Templater code block templates — no Templater dependency required.

## Features

- **Quick code block insertion**: Insert ` ```lang ` code blocks with cursor automatically positioned inside, ready to type
- **Wrap selection**: Select text, trigger the command, and it gets wrapped in a code block
- **Custom language list**: Defaults include python / javascript / bash / shell / sql / json / yaml / go / rust / java / html / css — add or remove as you like
- **Language picker modal**: Don't want to remember hotkeys? Use the "Choose language" command to pick from a list
- **Customizable hotkeys**: Configure hotkeys directly in the plugin settings panel
- **Hotkey conflict detection**: Instantly detects conflicts with other commands when you set a hotkey, shows a warning with a link to fix it
- **Smart line breaks**: Automatically handles line breaks when there's content around the cursor, no messy concatenation

## Installation

### From Community Plugins

1. Open Obsidian → Settings → Community plugins → Browse
2. Search for "Quick CodeBlock"
3. Click Install → Enable

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest [Release](https://github.com/xcloud-ai/quick-codeblock/releases)
2. Create the folder `.obsidian/plugins/quick-codeblock/` in your vault
3. Place the 3 files into that folder
4. Open Obsidian → Settings → Community plugins → turn off Safe mode → find "Quick CodeBlock" → enable it

## Usage

### Insert a code block

1. Press `Ctrl+P` (or `Cmd+P` on macOS) to open the command palette
2. Search for "Insert code block"
3. Choose the command for your desired language (e.g. "Insert code block (python)")
4. **No text selected**: inserts an empty code block with the cursor inside
5. **Text selected**: wraps the selected text in a ` ```lang ` block

### Configure hotkeys

1. Open plugin settings (Settings → Community plugins → Quick CodeBlock → Options)
2. In the "Hotkey settings" section, there's one default entry (python)
3. Click "+ Add hotkey config" to add more
4. Each entry lets you pick a language (dropdown) + set a hotkey + delete
5. Click the hotkey input box and press your key combination; press `Backspace` or `Esc` to clear
6. Conflicts are detected automatically — a red warning and a "Go fix" link appear if there's a conflict

### Replacing Templater

If you previously used Templater code block templates (like `codepython.md`), this plugin fully covers that use case:

| | Templater | This plugin |
|---|---|---|
| Dependency | Requires Templater plugin | None |
| Insert ```python + cursor | `tp.file.cursor()` | Auto-computes line position |
| Multiple languages | Need multiple templates | One plugin handles all |
| Wrap selection | Not supported | Supported |
| Hotkey management | Not supported | Built-in config + conflict detection |

## Settings

| Setting | Description |
|---------|-------------|
| Default language | Language used by the main "Insert code block" command |
| Language list | One per line — each registers its own command |
| Keep selection indent | Whether to preserve original indentation when wrapping selected text |
| Hotkey settings | Configure hotkeys for the languages you need (one by default, add more as needed) |

## Commands

| Command | Action |
|---------|--------|
| Insert code block (python) | Main command, uses default language |
| Insert code block (choose language) | Opens a list to pick a language |
| Insert code block (javascript) | One command per preset language |
| ... | Every language in your list gets its own command |

## Technical Notes

- Pure JavaScript implementation (`main.js`), no build step required — drop it in and it runs
- `main.ts` is the TypeScript source reference, for those who want to fork or modify
- Hotkeys are bound via `hotkeyManager.setHotkeys`, fully integrated with Obsidian's system hotkeys
- Hotkey bindings are automatically cleaned up when the plugin is uninstalled, keeping `hotkeys.json` clean

---

## 中文说明 / Chinese

快捷插入 Markdown 代码块，光标自动定位到块内。支持自定义语言、选中文本一键包裹、快捷键配置与冲突检测。

替代 Templater 的代码块模板，无需 Templater 依赖。

### 功能特性

- **快捷插入代码块**：插入 \`\`\`lang 代码块，光标自动定位到块内空行，直接开始写代码
- **选中文本包裹**：选中一段文字，触发命令，自动用代码块包裹
- **自定义语言列表**：默认含 python / javascript / bash / shell / sql / json / yaml / go / rust / java / html / css，可自行增删
- **语言选择弹窗**：不想记快捷键？用「选择语言」命令弹出列表点选
- **快捷键自定义**：在插件设置面板里直接为需要的语言配置快捷键，无需去系统设置里翻
- **快捷键冲突检测**：设置快捷键时即时检测是否与其他命令冲突，冲突显示警告并提供跳转入口
- **智能换行**：光标前后有内容时自动处理换行，不会粘连到已有文字

### 安装

#### 方式一：社区插件（审核通过后）

Obsidian → 设置 → 第三方插件 → 社区插件 → 搜索「Quick CodeBlock」→ 安装

#### 方式二：手动安装

1. 下载最新 Release 的 `main.js`、`manifest.json`、`styles.css`
2. 在 Obsidian 仓库下创建 `.obsidian/plugins/quick-codeblock/` 目录
3. 将 3 个文件放入该目录
4. Obsidian → 设置 → 第三方插件 → 关闭安全模式 → 找到「Quick CodeBlock」→ 开启

### 使用方法

#### 插入代码块

1. `Ctrl+P` 打开命令面板，搜索「插入代码块」
2. 选择对应语言的命令（如「插入代码块（python）」）
3. 无选中文本时：插入空代码块，光标自动定位到块内
4. 有选中文本时：用 \`\`\`lang 包裹选中的内容

#### 配置快捷键

1. 打开插件设置（设置 → 第三方插件 → Quick CodeBlock → 选项）
2. 在「快捷键设置」区域，默认有一项（python）
3. 点击「+ 添加快捷键配置」增加新项
4. 每项可选择语言（dropdown）+ 设置快捷键 + 删除
5. 点击快捷键输入框，按下组合键即可设置；按 `Backspace` 或 `Esc` 清除
6. 设置后自动检测冲突，有冲突会显示红色警告和「前往修改」链接

## License

[MIT License](./LICENSE)

## Author

**旭说云原生**
