/*
 * 代码块快捷插入 - main.ts (TypeScript 源码参考)
 *
 * 这是 main.js 的 TypeScript 版本，供需要类型检查或二次开发的用户参考。
 * 编译方法（需要 obsidian、@types/node、esbuild）：
 *   npm install obsidian @types/node esbuild
 *   esbuild main.ts --bundle --external:obsidian --format=cjs --outfile=main.js
 *
 * 已提供编译好的 main.js，通常无需自行编译。
 *
 * 快捷键由 Obsidian 原生「快捷键」设置页配置并持久化；
 * 设置面板每条语言提供「打开设置快捷键」按钮跳转并自动定位对应命令。
 * 旧版 data.json 自定义快捷键在启动时一次性迁移到原生配置。
 *
 * 双语 UI（中文 / 英文），可在设置面板顶部切换界面语言。
 */
import { App, Editor, Modal, Notice, Plugin, PluginSettingTab, Setting, TextComponent } from "obsidian";

interface PluginSettings {
  /** 语言列表：每个语言注册独立命令「插入代码块（语言名）」 */
  langs: string[];
  language: "zh" | "en";
}

/** 旧版 data.json 中的自定义快捷键（仅在启动迁移期间使用） */
interface LegacyHotkeyBinding {
  lang: string;
  hotkey: { modifiers: string[]; key: string };
}

const PLUGIN_ID = "quick-codeblock";
const GITHUB_URL = "https://github.com/xcloud-ai/quick-codeblock";

// ================================================================
//  i18n (Bilingual support)  中英双语
// ================================================================

const I18N: Record<string, Record<string, string>> = {
  zh: {
    // Commands
    cmd_insert_pick: "插入代码块（选择语言）",
    cmd_insert_lang: "插入代码块（{lang}）",
    // Modal
    modal_pick_title: "选择代码块语言",
    // Settings - title
    setting_title: "XU Quick CodeBlock（代码块快捷插入）",
    // Settings - language switcher
    setting_language: "界面语言",
    setting_language_desc: "选择设置面板的显示语言",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - hotkeys section
    sec_hotkeys: "快捷键",
    hotkeys_desc: "点击右上角 + 添加语言，每个语言会注册独立命令。输入语言名后点击「打开设置快捷键」，系统将打开快捷键设置页并搜索定位到该命令，按系统规则录制快捷键即可（冲突由系统原生提示）。",
    btn_add_lang: "添加语言",
    lang_placeholder: "语言名，如 python",
    hotkeys_empty: "暂无语言，点击「快捷键」右上角 + 添加",
    btn_open_hotkey: "打开设置快捷键",
    btn_delete_lang: "删除此语言",
    notice_lang_empty: "请先输入语言名",
    notice_hotkeys_located: "已打开快捷键设置并定位到「{name}」",
    notice_hotkeys_open_failed: "无法自动打开，请手动进入：设置 → 快捷键",
    // Settings - docs
    setting_docs: "使用文档",
    setting_docs_desc: "在 GitHub 查看完整使用说明",
    btn_github: "GitHub",
    // Settings - reset
    setting_reset: "恢复默认设置",
    setting_reset_desc: "将所有设置恢复为默认值（界面语言选择会被保留）",
    btn_reset: "重置",
    notice_reset: "设置已恢复为默认值",
  },
  en: {
    // Commands
    cmd_insert_pick: "Insert code block (pick language)",
    cmd_insert_lang: "Insert code block ({lang})",
    // Modal
    modal_pick_title: "Choose code block language",
    // Settings - title
    setting_title: "XU Quick CodeBlock",
    // Settings - language switcher
    setting_language: "UI Language",
    setting_language_desc: "Select the display language for settings panel",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - hotkeys section
    sec_hotkeys: "Hotkeys",
    hotkeys_desc: "Click + to add a language; each language registers its own command. After typing the language name, click \"Open hotkey settings\" — the native hotkeys page opens with the command located in search; record the hotkey there following system rules (conflicts are flagged natively).",
    btn_add_lang: "Add language",
    lang_placeholder: "Language, e.g. python",
    hotkeys_empty: "No languages yet. Click + next to \"Hotkeys\" to add one.",
    btn_open_hotkey: "Open hotkey settings",
    btn_delete_lang: "Delete this language",
    notice_lang_empty: "Please enter a language name first",
    notice_hotkeys_located: "Hotkeys settings opened and located '{name}'",
    notice_hotkeys_open_failed: "Cannot open automatically. Please go to: Settings → Hotkeys manually.",
    // Settings - docs
    setting_docs: "Documentation",
    setting_docs_desc: "View the full usage guide on GitHub",
    btn_github: "GitHub",
    // Settings - reset
    setting_reset: "Reset to defaults",
    setting_reset_desc: "Restore all settings to default values (UI language choice is preserved)",
    btn_reset: "Reset",
    notice_reset: "Settings reset to defaults",
  },
};

const DEFAULT_SETTINGS: PluginSettings = {
  langs: ["python", "shell", "yaml", "json"],
  language: "zh",
};

// ================================================================
//  工具函数（跳转原生快捷键设置页并自动定位命令）
// ================================================================

// 打开原生快捷键设置页；commandName 非空时自动填入搜索框定位
// （原生过滤函数绑定在搜索框 input 事件上，程序化赋值必须派发事件）
function openHotkeysSettings(app: App, commandName?: string): boolean {
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
  if (opened && commandName) {
    setTimeout(() => locateHotkeySearch(app, commandName), 250);
  }
  return opened;
}

// 定位：等快捷键页搜索框就绪后填入命令名并派发 input 事件
// （就绪检测用「连续两轮输入框元素引用稳定」，防设置页渲染时序竞态）
function locateHotkeySearch(app: App, query: string): void {
  let attempts = 20;
  let lastInput: HTMLInputElement | null = null;
  let stableRounds = 0;
  const locate = () => {
    try {
      const setting = (app as any).setting;
      const tab = setting && setting.activeTab;
      if (tab && tab.searchComponent && tab.searchComponent.inputEl) {
        const input = tab.searchComponent.inputEl as HTMLInputElement;
        if (input === lastInput) {
          stableRounds++;
        } else {
          stableRounds = 0;
          lastInput = input;
        }
        input.value = query || "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
        if (stableRounds >= 1) return; // 输入框已稳定且搜索词生效
      }
    } catch {}
    if (--attempts > 0) {
      setTimeout(locate, 120);
    }
  };
  locate();
}

export default class QuickCodeBlockPlugin extends Plugin {
  settings!: PluginSettings;
  /** 旧版 data.json 中的自定义快捷键（migrateLegacyHotkeys 消费后清空） */
  legacyHotkeys: LegacyHotkeyBinding[] = [];

  // i18n helper —— 支持可选的 {placeholder} 参数替换
  t(key: string, params?: Record<string, string>): string {
    const lang = this.settings ? this.settings.language : "zh";
    const dict = I18N[lang] || I18N.zh;
    let text = dict[key] || key;
    if (params) {
      for (const k of Object.keys(params)) {
        text = text.replace(new RegExp("\\{" + k + "\\}", "g"), params[k]);
      }
    }
    return text;
  }

  async onload(): Promise<void> {
    await this.loadSettings();
    await this.migrateLegacyHotkeys();
    this.registerCommands();
    this.addSettingTab(new CodeBlockSettingTab(this.app, this));
  }

  registerCommands(): void {
    // 1. 选择语言命令（主入口；未配置语言时插入无语言代码块）
    this.addCommand({
      id: "insert-codeblock-pick",
      name: this.t("cmd_insert_pick"),
      editorCallback: (editor: Editor) => {
        const langs = this.getLanguages();
        if (langs.length === 0) {
          this.insertCodeBlock(editor, "");
          return;
        }
        new LanguagePickerModal(this.app, langs, (lang: string) => {
          this.insertCodeBlock(editor, lang);
        }).open();
      },
    });

    // 2. 为设置里的每个语言注册独立命令
    //    快捷键由用户在 Obsidian 原生「快捷键」设置页配置（原生 hotkeys.json 持久化）
    for (const lang of this.getLanguages()) {
      this.addCommand({
        id: `insert-codeblock-${lang}`,
        name: this.t("cmd_insert_lang", { lang }),
        editorCallback: (editor: Editor) => this.insertCodeBlock(editor, lang),
      });
    }
  }

  // ================================================================
  //  旧版快捷键迁移（一次性）
  //  旧版把快捷键存 data.json（hotkeyConfigs 数组 / 更旧的 hotkeys 对象）
  //  并在每次 onload 用 setHotkeys 重绑（仅写内存不落盘）。
  //  新版改由 Obsidian 原生 hotkeys.json 持久化：首次加载时把旧值
  //  转写进原生配置（尊重原生已有值），不再写回 data.json。
  // ================================================================
  async migrateLegacyHotkeys(): Promise<void> {
    const list = this.legacyHotkeys || [];
    if (list.length === 0) return;
    const hm = (this.app as any).hotkeyManager;
    if (!hm) return;
    let migrated = 0;
    for (const { lang, hotkey } of list) {
      const fullId = `${PLUGIN_ID}:insert-codeblock-${lang}`;
      try {
        // 原生已有自定义快捷键时尊重原生值，不覆盖
        const existing = typeof hm.getHotkeys === "function" ? hm.getHotkeys(fullId) : null;
        if (existing && existing.length > 0) continue;
        hm.setHotkeys(fullId, [hotkey]);
        migrated++;
      } catch (e) {
        console.error(`[quick-codeblock] 迁移 ${lang} 快捷键失败:`, e);
      }
    }
    if (migrated > 0 && typeof hm.save === "function") {
      try {
        Promise.resolve(hm.save()).catch(() => {});
      } catch {}
    }
    this.legacyHotkeys = [];
  }

  // ================================================================
  //  核心：插入代码块
  // ================================================================
  insertCodeBlock(editor: Editor, lang: string): void {
    const selection = editor.getSelection();

    if (selection) {
      // 保留选中内容原样（含缩进）
      const block = "```" + lang + "\n" + selection + "\n```";
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

  // 语言列表：去空白、去空、去重（保持顺序）
  getLanguages(): string[] {
    const langs = this.settings.langs || [];
    const normalized: string[] = [];
    for (const s of langs) {
      const t = String(s == null ? "" : s).trim();
      if (t && !normalized.includes(t)) normalized.push(t);
    }
    return normalized;
  }

  async loadSettings(): Promise<void> {
    const data = ((await this.loadData()) || {}) as Record<string, any>;
    let langs: string[];
    // 是否显式配置过语言（全新安装 data 为空对象, 不显式配置）
    const hasExplicitLangs = Array.isArray(data.langs);
    if (hasExplicitLangs) {
      // 新版字段：即使为空数组也尊重（用户可能有意清空所有语言）
      langs = data.langs as string[];
    } else {
      // 旧版数据：从 languages 字符串 / defaultLanguage 合并
      langs = [];
      if (typeof data.languages === "string") {
        for (const s of data.languages.split(/[\n,，]/)) langs.push(s);
      }
      if (typeof data.defaultLanguage === "string") langs.push(data.defaultLanguage);
    }
    // 旧版自定义快捷键（hotkeyConfigs 数组 / 更旧的 hotkeys 对象）→ 迁移源，语言并入 langs
    this.legacyHotkeys = [];
    const legacyEntries: LegacyHotkeyBinding[] = Array.isArray(data.hotkeyConfigs)
      ? (data.hotkeyConfigs as any[])
          .filter((c: any) => c && c.lang && c.hotkey)
          .map((c: any) => ({ lang: c.lang as string, hotkey: c.hotkey }))
      : data.hotkeys && typeof data.hotkeys === "object"
        ? Object.entries(data.hotkeys as Record<string, any>)
            .filter(([, h]) => h)
            .map(([lang, hotkey]) => ({ lang, hotkey }))
        : [];
    for (const entry of legacyEntries) {
      if (!Array.isArray(data.langs)) langs.push(entry.lang);
      this.legacyHotkeys.push(entry);
    }
    // 归一化：去空白、去空、去重（保持顺序）
    const normalized: string[] = [];
    for (const s of langs) {
      const t = String(s == null ? "" : s).trim();
      if (t && !normalized.includes(t)) normalized.push(t);
    }
    // 全新安装 / 旧版迁移后为空 → 回退默认四语言（显式清空的不动）
    if (!hasExplicitLangs && normalized.length === 0) {
      normalized.push(...DEFAULT_SETTINGS.langs);
    }
    this.settings = {
      langs: normalized,
      language: data.language === "en" ? "en" : "zh",
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

// ================================================================
//  语言选择 Modal
// ================================================================
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
    const plugin = (this.app as any).plugins.plugins[PLUGIN_ID] as QuickCodeBlockPlugin;
    contentEl.createEl("h2", { text: plugin.t("modal_pick_title") });
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

// ================================================================
//  设置面板
// ================================================================
class CodeBlockSettingTab extends PluginSettingTab {
  plugin: QuickCodeBlockPlugin;

  constructor(app: App, plugin: QuickCodeBlockPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // i18n helper —— 委托给 plugin
  t(key: string, params?: Record<string, string>): string {
    return this.plugin.t(key, params);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: this.t("setting_title") });

    // ---- 界面语言切换器（顶部）----
    new Setting(containerEl)
      .setName(this.t("setting_language"))
      .setDesc(this.t("setting_language_desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("zh", this.t("lang_zh"))
          .addOption("en", this.t("lang_en"))
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as "zh" | "en";
            await this.plugin.saveSettings();
            // 重新注册命令（使命令名跟随语言）
            this.plugin.registerCommands();
            // 重新渲染设置面板
            this.display();
          })
      );

    containerEl.createEl("hr", { cls: "qcb-divider" });

    // ---- 快捷键设置：+ 添加语言，每条 = 语言名输入 + 打开设置快捷键 + 删除 ----
    new Setting(containerEl)
      .setName(this.t("sec_hotkeys"))
      .setDesc(this.t("hotkeys_desc"))
      .addExtraButton((btn) =>
        btn
          .setIcon("plus")
          .setTooltip(this.t("btn_add_lang"))
          .onClick(async () => {
            this.plugin.settings.langs.push("");
            await this.plugin.saveSettings();
            this.display();
          })
      );

    const langs = this.plugin.settings.langs;
    if (langs.length === 0) {
      containerEl.createEl("p", { cls: "qcb-desc", text: this.t("hotkeys_empty") });
    }
    for (let i = 0; i < langs.length; i++) {
      this.createLangEntry(i);
    }

    containerEl.createEl("hr", { cls: "qcb-divider" });

    // ---- GitHub 使用文档 ----
    new Setting(containerEl)
      .setName(this.t("setting_docs"))
      .setDesc(this.t("setting_docs_desc"))
      .addButton((btn) =>
        btn.setButtonText(this.t("btn_github")).onClick(() => {
          window.open(GITHUB_URL, "_blank");
        })
      );

    containerEl.createEl("hr", { cls: "qcb-divider" });

    // ---- 重置（保留界面语言）----
    new Setting(containerEl)
      .setName(this.t("setting_reset"))
      .setDesc(this.t("setting_reset_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(this.t("btn_reset"))
          .setWarning()
          .onClick(async () => {
            const savedLang = this.plugin.settings.language;
            this.plugin.settings = {
              langs: DEFAULT_SETTINGS.langs.slice(),
              language: savedLang,
            };
            await this.plugin.saveSettings();
            // 重新注册命令（命令名跟随语言）
            this.plugin.registerCommands();
            this.display();
            new Notice(this.t("notice_reset"), 2000);
          })
      );
  }

  // 单条语言配置：语言名输入框 + 「打开设置快捷键」按钮 + 删除按钮
  private createLangEntry(index: number): void {
    const plugin = this.plugin;
    let textComp: TextComponent | null = null;

    const setting = new Setting(this.containerEl);

    // 语言名输入：变更即保存，并注册/刷新对应独立命令
    setting.addText((text) => {
      textComp = text;
      text
        .setPlaceholder(this.t("lang_placeholder"))
        .setValue(plugin.settings.langs[index] || "");
      text.inputEl.addClass("qcb-lang-input");
      text.onChange(async (value) => {
        const v = value.trim();
        plugin.settings.langs[index] = v;
        await plugin.saveSettings();
        if (v) plugin.registerCommands(); // 空值不注册（命令 id 非法）
      });
    });

    // 打开设置快捷键：完整搜索「插件名: 命令名」定位到该语言命令
    setting.addButton((btn) =>
      btn.setButtonText(this.t("btn_open_hotkey")).onClick(() => {
        const lang = ((textComp && textComp.inputEl.value) || plugin.settings.langs[index] || "").trim();
        if (!lang) {
          new Notice(this.t("notice_lang_empty"), 3000);
          return;
        }
        const query = `${plugin.manifest.name}: ${this.t("cmd_insert_lang", { lang })}`;
        const ok = openHotkeysSettings(this.app, query);
        if (ok) {
          new Notice(this.t("notice_hotkeys_located", { name: query }), 6000);
        } else {
          new Notice(this.t("notice_hotkeys_open_failed"), 6000);
        }
      })
    );

    // 删除此语言
    setting.addExtraButton((btn) =>
      btn
        .setIcon("trash")
        .setTooltip(this.t("btn_delete_lang"))
        .onClick(async () => {
          plugin.settings.langs.splice(index, 1);
          await plugin.saveSettings();
          this.display();
        })
    );
  }
}
