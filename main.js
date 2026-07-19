/*
 * 代码块快捷插入 - main.js
 * 纯 JavaScript 实现，无需编译，直接放入插件目录即可运行
 *
 * 功能：
 *   1. 快捷插入代码块 ```lang ... ```，光标自动定位到块内
 *   2. 选中文本时，用代码块包裹选中的内容
 *   3. 自定义默认语言 + 常用语言列表
 *   4. 每个语言注册独立命令
 *   5. 「选择语言」命令弹出列表供选择
 *   6. 快捷键配置：默认一项（默认语言），用户可自行添加更多
 *   7. 设置快捷键后即时检测冲突，冲突时显示警告 + 跳转入口
 *
 * 替代 Templater 的 codepython.md 模板，无需 Templater 依赖。
 *
 * 双语 UI（中文 / 英文），可在设置面板顶部切换界面语言。
 */
const { Plugin, Notice, PluginSettingTab, Setting, Modal } = require("obsidian");

const PLUGIN_ID = "quick-codeblock";

// ================================================================
//  i18n (Bilingual support)  中英双语
// ================================================================

const I18N = {
  zh: {
    // Commands
    cmd_insert_default: "插入代码块（{lang}）",
    cmd_insert_pick: "插入代码块（选择语言）",
    cmd_insert_lang: "插入代码块（{lang}）",
    // Modal
    modal_pick_title: "选择代码块语言",
    // Settings - title
    setting_title: "代码块快捷插入",
    // Settings - language switcher
    setting_language: "界面语言",
    setting_language_desc: "选择设置面板的显示语言",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - basic
    setting_default_lang: "默认语言",
    setting_default_lang_desc: "主命令「插入代码块」使用的语言",
    setting_lang_list: "语言列表",
    setting_lang_list_desc: "每行一个语言，会为每个语言注册独立命令。修改后重新打开设置面板可刷新下方选项。",
    setting_keep_indent: "保留选中内容缩进",
    setting_keep_indent_desc: "选中文本包裹成代码块时，是否保留原有缩进",
    // Settings - hotkeys section
    sec_hotkeys: "快捷键设置",
    hotkeys_desc: "为需要的语言配置快捷键。点击输入框后按下组合键即可设置，按 <code>Backspace</code> 或 <code>Esc</code> 清除。设置后自动检测冲突。",
    btn_add_hotkey: "+ 添加快捷键配置",
    hotkey_placeholder: "点击设置…",
    // Settings - more hotkeys
    setting_more_hotkeys: "更多快捷键设置",
    setting_more_hotkeys_desc: "打开 Obsidian 系统的快捷键设置页面，可查看 / 修改所有命令的快捷键",
    btn_open_hotkeys: "打开 Obsidian 快捷键设置",
    notice_hotkeys_opened: "已打开快捷键设置，可在搜索框输入命令名查找",
    notice_hotkeys_failed: "无法自动打开，请手动进入：设置 → 快捷键",
    // Settings - tips
    tip_title: "使用方法",
    tip_1: "1. <code>Ctrl+P</code> 打开命令面板，搜索「插入代码块」",
    tip_2: "2. 无选中文本时：插入空代码块，光标自动定位到块内",
    tip_3: "3. 有选中文本时：用 <code>```lang</code> 包裹选中的内容",
    tip_4: "4. 在上方「快捷键设置」区域，点击「+ 添加」为需要的语言配置快捷键",
    tip_5: "5. 修改语言列表后，关闭再打开设置面板即可刷新选项",
    // Hotkey config item
    conflict_label: "⚠️ 冲突：",
    conflict_link: "前往修改 ›",
    no_conflict: "✓ 无冲突",
    btn_delete_config: "删除此配置",
    notice_cleared: "已清除：{lang} 快捷键",
    notice_set_failed: "设置失败：{msg}",
    notice_conflict: "⚠️ 「{hotkey}」与「{name}」冲突，点击警告中的「前往修改」处理",
    notice_set: "已设置：{lang} → {hotkey}",
    notice_search_conflict: "请在快捷键设置中搜索「{name}」查看并修改",
    // Settings - reset
    setting_reset: "恢复默认设置",
    setting_reset_desc: "将所有设置恢复为默认值（界面语言选择会被保留）",
    btn_reset: "重置",
    notice_reset: "设置已恢复为默认值",
  },
  en: {
    // Commands
    cmd_insert_default: "Insert code block ({lang})",
    cmd_insert_pick: "Insert code block (pick language)",
    cmd_insert_lang: "Insert code block ({lang})",
    // Modal
    modal_pick_title: "Choose code block language",
    // Settings - title
    setting_title: "Quick CodeBlock",
    // Settings - language switcher
    setting_language: "UI Language",
    setting_language_desc: "Select the display language for settings panel",
    lang_zh: "中文",
    lang_en: "English",
    // Settings - basic
    setting_default_lang: "Default language",
    setting_default_lang_desc: "Language used by the main \"Insert code block\" command",
    setting_lang_list: "Language list",
    setting_lang_list_desc: "One language per line. An independent command is registered for each. Reopen the settings panel after editing to refresh options below.",
    setting_keep_indent: "Keep selection indentation",
    setting_keep_indent_desc: "Whether to preserve original indentation when wrapping selected text into a code block",
    // Settings - hotkeys section
    sec_hotkeys: "Hotkey Settings",
    hotkeys_desc: "Configure hotkeys for the languages you need. Click the input box then press a key combo to set, press <code>Backspace</code> or <code>Esc</code> to clear. Conflicts are detected automatically.",
    btn_add_hotkey: "+ Add hotkey config",
    hotkey_placeholder: "Click to set…",
    // Settings - more hotkeys
    setting_more_hotkeys: "More hotkey settings",
    setting_more_hotkeys_desc: "Open Obsidian's built-in hotkey settings to view / modify hotkeys for all commands",
    btn_open_hotkeys: "Open Obsidian hotkey settings",
    notice_hotkeys_opened: "Hotkey settings opened. Type a command name in the search box to find it.",
    notice_hotkeys_failed: "Unable to open automatically. Please go to: Settings → Hotkeys",
    // Settings - tips
    tip_title: "Usage",
    tip_1: "1. Press <code>Ctrl+P</code> to open the command palette and search for \"Insert code block\"",
    tip_2: "2. With no selection: inserts an empty code block and places the cursor inside",
    tip_3: "3. With a selection: wraps the selected text with <code>```lang</code>",
    tip_4: "4. In the \"Hotkey Settings\" area above, click \"+ Add\" to configure hotkeys for languages you need",
    tip_5: "5. After editing the language list, close and reopen the settings panel to refresh options",
    // Hotkey config item
    conflict_label: "⚠️ Conflict: ",
    conflict_link: "Fix ›",
    no_conflict: "✓ No conflict",
    btn_delete_config: "Delete this config",
    notice_cleared: "Cleared: {lang} hotkey",
    notice_set_failed: "Failed to set: {msg}",
    notice_conflict: "⚠️ \"{hotkey}\" conflicts with \"{name}\". Click \"Fix\" in the warning to resolve.",
    notice_set: "Set: {lang} → {hotkey}",
    notice_search_conflict: 'Search "{name}" in hotkey settings to view and modify it',
    // Settings - reset
    setting_reset: "Reset to defaults",
    setting_reset_desc: "Restore all settings to default values (UI language choice is preserved)",
    btn_reset: "Reset",
    notice_reset: "Settings reset to defaults",
  },
};

const DEFAULT_SETTINGS = {
  defaultLanguage: "python",
  languages: "python\njavascript\nbash\nshell\nsql\njson\nyaml\ngo\nrust\njava\nhtml\ncss",
  keepIndent: true,
  language: "zh", // "zh" or "en"
  // 快捷键配置列表：用户主动添加，默认只有一项（默认语言）
  // 每项: { lang: "python", hotkey: { modifiers, key } | null }
  hotkeyConfigs: [{ lang: "python", hotkey: null }],
};

// ================================================================
//  工具函数（快捷键格式化 / 冲突检测 / 跳转）
// ================================================================

function formatHotkey(hotkey) {
  if (!hotkey) return "";
  const modMap = { Mod: "Ctrl", Ctrl: "Ctrl", Alt: "Alt", Shift: "Shift", Meta: "Win" };
  const mods = (hotkey.modifiers || []).slice().sort().map((m) => modMap[m] || m);
  return mods.length > 0 ? `${mods.join(" + ")} + ${hotkey.key}` : hotkey.key;
}

function getEffectiveHotkeys(hotkeyManager, commandId) {
  try {
    if (typeof hotkeyManager.getEffectiveHotkeys === "function") {
      return hotkeyManager.getEffectiveHotkeys(commandId) || [];
    }
    const custom = hotkeyManager.getHotkeys ? hotkeyManager.getHotkeys(commandId) || [] : [];
    const baked = hotkeyManager.getBakedHotkeys ? hotkeyManager.getBakedHotkeys(commandId) || [] : [];
    return custom.length > 0 ? custom : baked;
  } catch (e) {
    return [];
  }
}

function findConflict(app, ownCommandId, hotkey) {
  if (!hotkey) return null;
  const targetCombo = formatHotkey(hotkey);
  const hotkeyManager = app.hotkeyManager;
  const commands = app.commands.commands;
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

function openHotkeysSettings(app) {
  let opened = false;
  try {
    if (app.setting && typeof app.setting.openTabById === "function") {
      app.setting.openTabById("hotkeys");
      opened = true;
    }
  } catch (e) {}
  if (!opened) {
    try {
      if (typeof app.openSettings === "function") {
        app.openSettings();
        opened = true;
      }
    } catch (e) {}
  }
  if (!opened) {
    try {
      app.commands.executeCommandById("app:open-settings");
      opened = true;
    } catch (e) {}
  }
  if (opened) {
    setTimeout(() => {
      try {
        if (app.setting && typeof app.setting.openTabById === "function") {
          app.setting.openTabById("hotkeys");
        }
      } catch (e) {}
    }, 200);
  }
  return opened;
}

// ================================================================
//  插件主类
// ================================================================
class QuickCodeBlockPlugin extends Plugin {
  // i18n helper —— 支持可选的 {placeholder} 参数替换
  t(key, params) {
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

  async onload() {
    await this.loadSettings();
    this.registerCommands();
    this.addSettingTab(new CodeBlockSettingTab(this.app, this));
  }

  onunload() {
    // 卸载时清除所有快捷键绑定
    for (const config of this.settings.hotkeyConfigs) {
      const fullId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
      try {
        this.app.hotkeyManager.removeHotkeys(fullId);
      } catch (e) {}
    }
  }

  registerCommands() {
    const def = this.settings.defaultLanguage;

    // 1. 主命令
    this.addCommand({
      id: "insert-codeblock-default",
      name: this.t("cmd_insert_default", { lang: def }),
      editorCallback: (editor) => this.insertCodeBlock(editor, def),
    });

    // 2. 选择语言命令
    this.addCommand({
      id: "insert-codeblock-pick",
      name: this.t("cmd_insert_pick"),
      editorCallback: (editor) => {
        const langs = this.getLanguages();
        new LanguagePickerModal(this.app, langs, (lang) => {
          this.insertCodeBlock(editor, lang);
        }).open();
      },
    });

    // 3. 为语言列表的每个语言注册命令（命令始终注册，快捷键按需绑定）
    for (const lang of this.getLanguages()) {
      this.addCommand({
        id: `insert-codeblock-${lang}`,
        name: this.t("cmd_insert_lang", { lang: lang }),
        editorCallback: (editor) => this.insertCodeBlock(editor, lang),
      });
    }

    // 4. 为 hotkeyConfigs 里的配置绑定快捷键
    for (const config of this.settings.hotkeyConfigs) {
      if (config.hotkey) {
        const fullId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
        try {
          this.app.hotkeyManager.setHotkeys(fullId, [config.hotkey]);
        } catch (e) {
          console.error(`[quick-codeblock] 绑定 ${config.lang} 快捷键失败:`, e);
        }
      }
    }
  }

  // ================================================================
  //  核心：插入代码块
  // ================================================================
  insertCodeBlock(editor, lang) {
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
    const targetLine =
      afterCursor.trim() !== "" ? newCursor.line - 2 : newCursor.line - 1;
    editor.setCursor({ line: targetLine, ch: 0 });
  }

  getLanguages() {
    return this.settings.languages
      .split(/[\n,，]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    // 兼容旧格式 hotkeys 对象 → 迁移到 hotkeyConfigs 数组
    if (!this.settings.hotkeyConfigs) {
      if (this.settings.hotkeys && typeof this.settings.hotkeys === "object") {
        this.settings.hotkeyConfigs = Object.entries(this.settings.hotkeys)
          .filter(([_, h]) => h)
          .map(([lang, hotkey]) => ({ lang, hotkey }));
      } else {
        this.settings.hotkeyConfigs = [{ lang: this.settings.defaultLanguage, hotkey: null }];
      }
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

// ================================================================
//  语言选择 Modal
// ================================================================
class LanguagePickerModal extends Modal {
  constructor(app, languages, onChoose) {
    super(app);
    this.languages = languages;
    this.onChoose = onChoose;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("qcb-picker");
    contentEl.createEl("h2", { text: this.app.plugins.plugins[PLUGIN_ID].t("modal_pick_title") });

    const grid = contentEl.createEl("div", { cls: "qcb-lang-grid" });
    for (const lang of this.languages) {
      const item = grid.createEl("div", { cls: "qcb-lang-item", text: lang });
      item.addEventListener("click", () => {
        this.onChoose(lang);
        this.close();
      });
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

// ================================================================
//  设置面板
// ================================================================
class CodeBlockSettingTab extends PluginSettingTab {
  // i18n helper —— 委托给 plugin
  t(key, params) {
    return this.plugin.t(key, params);
  }

  display() {
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
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            // 重新注册命令（使命令名跟随语言）
            this.plugin.registerCommands();
            // 重新渲染设置面板
            this.display();
          })
      );

    containerEl.createEl("hr", { cls: "qcb-divider" });

    // ---- 基础设置 ----
    new Setting(containerEl)
      .setName(this.t("setting_default_lang"))
      .setDesc(this.t("setting_default_lang_desc"))
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
      .setName(this.t("setting_lang_list"))
      .setDesc(this.t("setting_lang_list_desc"))
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
      .setName(this.t("setting_keep_indent"))
      .setDesc(this.t("setting_keep_indent_desc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.keepIndent)
          .onChange(async (value) => {
            this.plugin.settings.keepIndent = value;
            await this.plugin.saveSettings();
          })
      );

    // ---- 快捷键设置区域 ----
    containerEl.createEl("hr", { cls: "qcb-divider" });
    containerEl.createEl("h3", { text: this.t("sec_hotkeys") });

    const desc = containerEl.createEl("p", { cls: "qcb-desc" });
    desc.innerHTML = this.t("hotkeys_desc");

    // 配置列表
    const configs = this.plugin.settings.hotkeyConfigs;
    for (let i = 0; i < configs.length; i++) {
      this.createHotkeyConfigItem(i);
    }

    // 添加按钮
    new Setting(containerEl).addButton((btn) =>
      btn
        .setButtonText(this.t("btn_add_hotkey"))
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

    // ---- 更多入口 ----
    containerEl.createEl("hr", { cls: "qcb-divider" });

    new Setting(containerEl)
      .setName(this.t("setting_more_hotkeys"))
      .setDesc(this.t("setting_more_hotkeys_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(this.t("btn_open_hotkeys"))
          .onClick(() => {
            const ok = openHotkeysSettings(this.app);
            if (ok) {
              new Notice(this.t("notice_hotkeys_opened"), 6000);
            } else {
              new Notice(this.t("notice_hotkeys_failed"), 6000);
            }
          })
      );

    // ---- 使用说明 ----
    const tip = containerEl.createEl("div", { cls: "qcb-tip" });
    tip.innerHTML =
      "<b>" + this.t("tip_title") + "</b><br>" +
      this.t("tip_1") + "<br>" +
      this.t("tip_2") + "<br>" +
      this.t("tip_3") + "<br>" +
      this.t("tip_4") + "<br>" +
      this.t("tip_5");

    // ---- 重置（保留语言选择）----
    containerEl.createEl("hr", { cls: "qcb-divider" });

    new Setting(containerEl)
      .setName(this.t("setting_reset"))
      .setDesc(this.t("setting_reset_desc"))
      .addButton((btn) =>
        btn
          .setButtonText(this.t("btn_reset"))
          .setWarning()
          .onClick(async () => {
            const savedLang = this.plugin.settings.language;
            this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
            this.plugin.settings.language = savedLang;
            await this.plugin.saveSettings();
            // 重新注册命令（命令名跟随语言）
            this.plugin.registerCommands();
            this.display();
            new Notice(this.t("notice_reset"), 2000);
          })
      );
  }

  // 创建单个快捷键配置项：语言选择 + 快捷键输入 + 冲突检测 + 删除
  createHotkeyConfigItem(index) {
    const plugin = this.plugin;
    const config = plugin.settings.hotkeyConfigs[index];
    const fullId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;

    const setting = new Setting(this.containerEl);

    // 语言选择 dropdown
    const select = setting.controlEl.createEl("select", { cls: "qcb-lang-select" });
    const langs = plugin.getLanguages();
    // 确保当前 lang 在选项里（即使不在列表中）
    if (!langs.includes(config.lang)) langs.unshift(config.lang);
    for (const lang of langs) {
      const option = select.createEl("option", { value: lang, text: lang });
      if (lang === config.lang) option.selected = true;
    }

    // 快捷键输入框
    const inputEl = setting.controlEl.createEl("input", {
      type: "text",
      cls: "qcb-hotkey-input",
      attr: { readonly: true, placeholder: this.t("hotkey_placeholder") },
    });
    inputEl.value = formatHotkey(config.hotkey);

    // 冲突提示
    const warningEl = setting.descEl.createEl("div", { cls: "qcb-warning" });

    const updateWarning = (hotkey, lang) => {
      warningEl.empty();
      warningEl.removeClass("has-conflict");
      if (!hotkey) return;
      const currentFullId = `${PLUGIN_ID}:insert-codeblock-${lang}`;
      const conflict = findConflict(this.app, currentFullId, hotkey);
      if (conflict) {
        warningEl.addClass("has-conflict");
        warningEl.createEl("span", { text: this.t("conflict_label"), cls: "qcb-conflict-label" });
        warningEl.createEl("span", { text: conflict.commandName, cls: "qcb-conflict-name" });
        warningEl.createEl("span", { text: "  " });
        const link = warningEl.createEl("a", {
          text: this.t("conflict_link"),
          cls: "qcb-conflict-link",
          attr: { href: "#" },
        });
        link.addEventListener("click", (ev) => {
          ev.preventDefault();
          openHotkeysSettings(this.app);
          new Notice(this.t("notice_search_conflict", { name: conflict.commandName }), 8000);
        });
      } else {
        warningEl.createEl("span", { text: this.t("no_conflict"), cls: "qcb-ok" });
      }
    };

    updateWarning(config.hotkey, config.lang);

    // 语言变更：清除旧绑定，绑定到新语言
    select.addEventListener("change", async () => {
      // 清除旧语言的快捷键
      if (config.hotkey) {
        try {
          this.app.hotkeyManager.removeHotkeys(`${PLUGIN_ID}:insert-codeblock-${config.lang}`);
        } catch (e) {}
      }
      config.lang = select.value;
      // 绑定到新语言
      if (config.hotkey) {
        const newFullId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
        try {
          this.app.hotkeyManager.setHotkeys(newFullId, [config.hotkey]);
        } catch (e) {}
      }
      await plugin.saveSettings();
      // 更新冲突检测
      updateWarning(config.hotkey, config.lang);
    });

    // 录制状态
    inputEl.addEventListener("focus", () => inputEl.addClass("recording"));
    inputEl.addEventListener("blur", () => inputEl.removeClass("recording"));

    // 捕获按键
    inputEl.addEventListener("keydown", async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const key = ev.key;

      // 清除
      if (key === "Backspace" || key === "Escape" || key === "Delete") {
        if (config.hotkey) {
          try {
            this.app.hotkeyManager.removeHotkeys(`${PLUGIN_ID}:insert-codeblock-${config.lang}`);
          } catch (e) {}
        }
        config.hotkey = null;
        inputEl.value = "";
        await plugin.saveSettings();
        updateWarning(null, config.lang);
        new Notice(this.t("notice_cleared", { lang: config.lang }), 2000);
        return;
      }

      if (["Control", "Alt", "Shift", "Meta", "Tab"].includes(key)) return;

      const modifiers = [];
      if (ev.ctrlKey) modifiers.push("Mod");
      if (ev.altKey) modifiers.push("Alt");
      if (ev.shiftKey) modifiers.push("Shift");
      if (ev.metaKey) modifiers.push("Meta");

      let displayKey = key;
      if (key.length === 1) displayKey = key.toUpperCase();

      const hotkey = { modifiers, key: displayKey };
      config.hotkey = hotkey;
      inputEl.value = formatHotkey(hotkey);

      // 绑定
      const bindId = `${PLUGIN_ID}:insert-codeblock-${config.lang}`;
      try {
        this.app.hotkeyManager.setHotkeys(bindId, [hotkey]);
      } catch (e) {
        console.error(`[quick-codeblock] 设置 ${config.lang} 快捷键失败:`, e);
        new Notice(this.t("notice_set_failed", { msg: e.message }), 5000);
        return;
      }

      await plugin.saveSettings();
      updateWarning(hotkey, config.lang);

      const conflict = findConflict(this.app, bindId, hotkey);
      if (conflict) {
        new Notice(
          this.t("notice_conflict", { hotkey: formatHotkey(hotkey), name: conflict.commandName }),
          8000
        );
      } else {
        new Notice(this.t("notice_set", { lang: config.lang, hotkey: formatHotkey(hotkey) }), 2000);
      }
    });

    // 删除按钮
    setting.addExtraButton((btn) =>
      btn
        .setIcon("trash")
        .setTooltip(this.t("btn_delete_config"))
        .onClick(async () => {
          if (config.hotkey) {
            try {
              this.app.hotkeyManager.removeHotkeys(`${PLUGIN_ID}:insert-codeblock-${config.lang}`);
            } catch (e) {}
          }
          plugin.settings.hotkeyConfigs.splice(index, 1);
          await plugin.saveSettings();
          this.display();
        })
    );
  }
}

module.exports = QuickCodeBlockPlugin;
