/*
 * 代码块快捷插入 - main.ts (TypeScript 源码参考)
 *
 * 这是 main.js 的 TypeScript 版本，供需要类型检查或二次开发的用户参考。
 * 编译方法（需要 obsidian、@types/node、esbuild）：
 *   npm install obsidian @types/node esbuild
 *   esbuild main.ts --bundle --external:obsidian --format=cjs --outfile=main.js
 *
 * 已提供编译好的 main.js，通常无需自行编译。
 */
import { App, Editor, Modal, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

interface Hotkey {
  modifiers: string[];
  key: string;
}

interface HotkeyConfig {
  lang: string;
  hotkey: Hotkey | null;
}

interface ConflictInfo {
  commandId: string;
  commandName: string;
}

interface PluginSettings {
  defaultLanguage: string;
  languages: string;
  keepIndent: boolean;
  hotkeyConfigs: HotkeyConfig[];
}

const PLUGIN_ID = "quick-codeblock";

const DEFAULT_SETTINGS: PluginSettings = {
  defaultLanguage: "python",
  languages: "python\njavascript\nbash\nshell\nsql\njson\nyaml\ngo\nrust\njava\nhtml\ncss",
  keepIndent: true,
  hotkeyConfigs: [{ lang: "python", hotkey: null }],
};

function formatHotkey(hotkey: Hotkey | null): string {
  if (!hotkey) return "";
  const modMap: Record<string, string> = { Mod: "Ctrl", Ctrl: "Ctrl", Alt: "Alt", Shift: "Shift", Meta: "Win" };
  const mods = (hotkey.modifiers || []).slice().sort().map((m) => modMap[m] || m);
  return mods.length > 0 ? `${mods.join(" + ")} + ${hotkey.key}` : hotkey.key;
}

function getEffectiveHotkeys(hotkeyManager: any, commandId: string): any[] {
  try {
    if (typeof hotkeyManager.getEffectiveHotkeys === "function") {
      return hotkeyManager.getEffectiveHotkeys(commandId) || [];
    }
    const custom = hotkeyManager.getHotkeys ? hotkeyManager.getHotkeys(commandId) || [] : [];
    const baked = hotkeyManager.getBakedHotkeys ? hotkeyManager.getBakedHotkeys(commandId) || [] : [];
    return custom.length > 0 ? custom : baked;
  } catch {
    return [];
  }
}

function findConflict(app: App, ownCommandId: string, hotkey: Hotkey | null): ConflictInfo | null {
  if (!hotkey) return null;
  const targetCombo = formatHotkey(hotkey);
  const hotkeyManager = (app as any).hotkeyManager;
  const commands = (app as any).commands.commands as Record<string, { name: string }>;
  for (const id of Object.keys(commands)) {
    if (id === ownCommandId) continue;
    const effective = getEffectiveHotkeys(hotkeyManager, id);
    for (const h of effective) {
      if (formatHotkey(h) === targetCombo) {
        return { commandId: id, commandName: commands[id].name || id };
      }
    }
  }
  return null;
}

function openHotkeysSettings(app: App): boolean {
  let opened = false;
  try {
    const setting = (app as any).setting;
    if (setting && typeof setting.openTabById === "function") {
      setting.openTabById("hotkeys");
      opened = true;
    }
  } catch {}
  if (!opened) {
    try {
      (app as any).openSettings();
      opened = true;
    } catch {}
  }
  if (!opened) {
    try {
      app.commands.executeCommandById("app:open-settings" as any);
      opened = true;
    } catch {}
  }
  if (opened) {
    setTimeout(() => {
      try {
        const setting = (app as any).setting;
        if (setting && typeof setting.openTabById === "function") {
          setting.openTabById("hotkeys");
        }
      } catch {}
    }, 200);
  }
  return opened;
}

export default class QuickCodeBlockPlugin extends Plugin {
  settings!: PluginSettings;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.registerCommands();
    this.addSettingTab(new CodeBlockSettingTab(this.app, this));
  }

  onunload(): void {
    for (const config of this.settings.hotkeyConfigs) {
      const fullId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
      try {
        (this.app as any).hotkeyManager.removeHotkeys(fullId);
      } catch {}
    }
  }

  private registerCommands(): void {
    const def = this.settings.defaultLanguage;
    this.addCommand({
      id: "insert-codeblock-default",
      name: `插入代码块（${def}）`,
      editorCallback: (editor: Editor) => this.insertCodeBlock(editor, def),
    });

    this.addCommand({
      id: "insert-codeblock-pick",
      name: "插入代码块（选择语言）",
      editorCallback: (editor: Editor) => {
        const langs = this.getLanguages();
        new LanguagePickerModal(this.app, langs, (lang: string) => {
          this.insertCodeBlock(editor, lang);
        }).open();
      },
    });

    for (const lang of this.getLanguages()) {
      this.addCommand({
        id: `insert-codeblock-${lang}`,
        name: `插入代码块（${lang}）`,
        editorCallback: (editor: Editor) => this.insertCodeBlock(editor, lang),
      });
    }

    for (const config of this.settings.hotkeyConfigs) {
      if (config.hotkey) {
        const fullId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
        try {
          (this.app as any).hotkeyManager.setHotkeys(fullId, [config.hotkey]);
        } catch (e) {
          console.error(`[quick-codeblock] 绑定 ${config.lang} 快捷键失败:`, e);
        }
      }
    }
  }

  insertCodeBlock(editor: Editor, lang: string): void {
    const selection = editor.getSelection();
    if (selection) {
      const content = this.settings.keepIndent ? selection : selection.trim();
      const block = "```" + lang + "\n" + content + "\n```";
      editor.replaceSelection(block);
      return;
    }

    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const beforeCursor = line.substring(0, cursor.ch);
    const afterCursor = line.substring(cursor.ch);

    let block = "```" + lang + "\n\n```";
    if (beforeCursor.trim() !== "") block = "\n" + block;
    if (afterCursor.trim() !== "") block = block + "\n";

    editor.replaceSelection(block);

    const newCursor = editor.getCursor();
    const targetLine = afterCursor.trim() !== "" ? newCursor.line - 2 : newCursor.line - 1;
    editor.setCursor({ line: targetLine, ch: 0 });
  }

  private getLanguages(): string[] {
    return this.settings.languages
      .split(/[\n,，]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!this.settings.hotkeyConfigs) {
      if ((this.settings as any).hotkeys && typeof (this.settings as any).hotkeys === "object") {
        this.settings.hotkeyConfigs = Object.entries((this.settings as any).hotkeys)
          .filter(([_, h]: [string, any]) => h)
          .map(([lang, hotkey]: [string, any]) => ({ lang, hotkey }));
      } else {
        this.settings.hotkeyConfigs = [{ lang: this.settings.defaultLanguage, hotkey: null }];
      }
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class LanguagePickerModal extends Modal {
  private languages: string[];
  private onChoose: (lang: string) => void;

  constructor(app: App, languages: string[], onChoose: (lang: string) => void) {
    super(app);
    this.languages = languages;
    this.onChoose = onChoose;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("qcb-picker");
    contentEl.createEl("h2", { text: "选择代码块语言" });
    const grid = contentEl.createEl("div", { cls: "qcb-lang-grid" });
    for (const lang of this.languages) {
      const item = grid.createEl("div", { cls: "qcb-lang-item", text: lang });
      item.addEventListener("click", () => {
        this.onChoose(lang);
        this.close();
      });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

class CodeBlockSettingTab extends PluginSettingTab {
  plugin: QuickCodeBlockPlugin;

  constructor(app: App, plugin: QuickCodeBlockPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "代码块快捷插入" });

    new Setting(containerEl)
      .setName("默认语言")
      .setDesc("主命令「插入代码块」使用的语言")
      .addText((text) =>
        text
          .setPlaceholder("python")
          .setValue(this.plugin.settings.defaultLanguage)
          .onChange(async (value) => {
            this.plugin.settings.defaultLanguage = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("语言列表")
      .setDesc("每行一个语言，会为每个语言注册独立命令。修改后重新打开设置面板可刷新下方选项。")
      .addTextArea((text) => {
        text
          .setPlaceholder("python\njavascript\nbash\n...")
          .setValue(this.plugin.settings.languages)
          .onChange(async (value) => {
            this.plugin.settings.languages = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 8;
        text.inputEl.cols = 30;
      });

    new Setting(containerEl)
      .setName("保留选中内容缩进")
      .setDesc("选中文本包裹成代码块时，是否保留原有缩进")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.keepIndent)
          .onChange(async (value) => {
            this.plugin.settings.keepIndent = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("hr", { cls: "qcb-divider" });
    containerEl.createEl("h3", { text: "快捷键设置" });

    const desc = containerEl.createEl("p", { cls: "qcb-desc" });
    desc.innerHTML =
      "为需要的语言配置快捷键。点击输入框后按下组合键即可设置，" +
      "按 <code>Backspace</code> 或 <code>Esc</code> 清除。设置后自动检测冲突。";

    const configs = this.plugin.settings.hotkeyConfigs;
    for (let i = 0; i < configs.length; i++) {
      this.createHotkeyConfigItem(i);
    }

    new Setting(containerEl).addButton((btn) =>
      btn
        .setButtonText("+ 添加快捷键配置")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.hotkeyConfigs.push({
            lang: this.plugin.settings.defaultLanguage,
            hotkey: null,
          });
          await this.plugin.saveSettings();
          this.display();
        })
    );

    containerEl.createEl("hr", { cls: "qcb-divider" });

    new Setting(containerEl)
      .setName("更多快捷键设置")
      .setDesc("打开 Obsidian 系统的快捷键设置页面，可查看 / 修改所有命令的快捷键")
      .addButton((btn) =>
        btn
          .setButtonText("打开 Obsidian 快捷键设置")
          .onClick(() => {
            const ok = openHotkeysSettings(this.app);
            if (ok) {
              new Notice("已打开快捷键设置，可在搜索框输入命令名查找", 6000);
            } else {
              new Notice("无法自动打开，请手动进入：设置 → 快捷键", 6000);
            }
          })
      );

    const tip = containerEl.createEl("div", { cls: "qcb-tip" });
    tip.innerHTML =
      "<b>使用方法</b><br>" +
      "1. <code>Ctrl+P</code> 打开命令面板，搜索「插入代码块」<br>" +
      "2. 无选中文本时：插入空代码块，光标自动定位到块内<br>" +
      "3. 有选中文本时：用 <code>```lang</code> 包裹选中的内容<br>" +
      "4. 在上方「快捷键设置」区域，点击「+ 添加」为需要的语言配置快捷键<br>" +
      "5. 修改语言列表后，关闭再打开设置面板即可刷新选项";
  }

  private createHotkeyConfigItem(index: number): void {
    const plugin = this.plugin;
    const config = plugin.settings.hotkeyConfigs[index];

    const setting = new Setting(this.containerEl);

    const select = setting.controlEl.createEl("select", { cls: "qcb-lang-select" });
    const langs = plugin.getLanguages();
    if (!langs.includes(config.lang)) langs.unshift(config.lang);
    for (const lang of langs) {
      const option = select.createEl("option", { value: lang, text: lang });
      if (lang === config.lang) option.selected = true;
    }

    const inputEl = setting.controlEl.createEl("input", {
      type: "text",
      cls: "qcb-hotkey-input",
      attr: { readonly: true, placeholder: "点击设置…" },
    });
    inputEl.value = formatHotkey(config.hotkey);

    const warningEl = setting.descEl.createEl("div", { cls: "qcb-warning" });

    const updateWarning = (hotkey: Hotkey | null, lang: string) => {
      warningEl.empty();
      warningEl.removeClass("has-conflict");
      if (!hotkey) return;
      const currentFullId = `${PLUGIN_ID}:insert-codeblock-${lang}`;
      const conflict = findConflict(this.app, currentFullId, hotkey);
      if (conflict) {
        warningEl.addClass("has-conflict");
        warningEl.createEl("span", { text: "⚠️ 冲突：", cls: "qcb-conflict-label" });
        warningEl.createEl("span", { text: conflict.commandName, cls: "qcb-conflict-name" });
        warningEl.createEl("span", { text: "  " });
        const link = warningEl.createEl("a", {
          text: "前往修改 ›",
          cls: "qcb-conflict-link",
          attr: { href: "#" },
        });
        link.addEventListener("click", (ev: MouseEvent) => {
          ev.preventDefault();
          openHotkeysSettings(this.app);
          new Notice(`请在快捷键设置中搜索「${conflict.commandName}」查看并修改`, 8000);
        });
      } else {
        warningEl.createEl("span", { text: "✓ 无冲突", cls: "qcb-ok" });
      }
    };

    updateWarning(config.hotkey, config.lang);

    select.addEventListener("change", async () => {
      if (config.hotkey) {
        try {
          (this.app as any).hotkeyManager.removeHotkeys(`${PLUGIN_ID}:insert-codeblock-${config.lang}`);
        } catch {}
      }
      config.lang = select.value;
      if (config.hotkey) {
        const newFullId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
        try {
          (this.app as any).hotkeyManager.setHotkeys(newFullId, [config.hotkey]);
        } catch {}
      }
      await plugin.saveSettings();
      updateWarning(config.hotkey, config.lang);
    });

    inputEl.addEventListener("focus", () => inputEl.addClass("recording"));
    inputEl.addEventListener("blur", () => inputEl.removeClass("recording"));

    inputEl.addEventListener("keydown", async (ev: KeyboardEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      const key = ev.key;

      if (key === "Backspace" || key === "Escape" || key === "Delete") {
        if (config.hotkey) {
          try {
            (this.app as any).hotkeyManager.removeHotkeys(`${PLUGIN_ID}:insert-codeblock-${config.lang}`);
          } catch {}
        }
        config.hotkey = null;
        inputEl.value = "";
        await plugin.saveSettings();
        updateWarning(null, config.lang);
        new Notice(`已清除：${config.lang} 快捷键`, 2000);
        return;
      }

      if (["Control", "Alt", "Shift", "Meta", "Tab"].includes(key)) return;

      const modifiers: string[] = [];
      if (ev.ctrlKey) modifiers.push("Mod");
      if (ev.altKey) modifiers.push("Alt");
      if (ev.shiftKey) modifiers.push("Shift");
      if (ev.metaKey) modifiers.push("Meta");

      let displayKey = key;
      if (key.length === 1) displayKey = key.toUpperCase();

      const hotkey: Hotkey = { modifiers, key: displayKey };
      config.hotkey = hotkey;
      inputEl.value = formatHotkey(hotkey);

      const bindId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
      try {
        (this.app as any).hotkeyManager.setHotkeys(bindId, [hotkey]);
      } catch (e: any) {
        console.error(`[quick-codeblock] 设置 ${config.lang} 快捷键失败:`, e);
        new Notice(`设置失败：${e.message}`, 5000);
        return;
      }

      await plugin.saveSettings();
      updateWarning(hotkey, config.lang);

      const conflict = findConflict(this.app, bindId, hotkey);
      if (conflict) {
        new Notice(
          `⚠️ 「${formatHotkey(hotkey)}」与「${conflict.commandName}」冲突，点击警告中的「前往修改」处理`,
          8000
        );
      } else {
        new Notice(`已设置：${config.lang} → ${formatHotkey(hotkey)}`, 2000);
      }
    });

    setting.addExtraButton((btn) =>
      btn
        .setIcon("trash")
        .setTooltip("删除此配置")
        .onClick(async () => {
          if (config.hotkey) {
            try {
              (this.app as any).hotkeyManager.removeHotkeys(`${PLUGIN_ID}:insert-codeblock-${config.lang}`);
            } catch {}
          }
          plugin.settings.hotkeyConfigs.splice(index, 1);
          await plugin.saveSettings();
          this.display();
        })
    );
  }
}
