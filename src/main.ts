import { Modal, Notice, Plugin, Setting, TFile, TFolder, normalizePath } from "obsidian";
import { MiniCalendarWidget } from "./calendar-widget";
import { replaceTemplateVariables, shouldConfirmDailyNoteCreation } from "./calendar-utils";
import { getStrings } from "./i18n";
import {
  DEFAULT_SETTINGS,
  MiniCalendarSettingTab,
  normalizeSettings,
  type MiniCalendarSettings
} from "./settings";

interface DailyNotesOptions {
  folder?: string;
  format?: string;
  template?: string;
}

interface InternalPluginRecord {
  enabled?: boolean;
  instance?: { options?: DailyNotesOptions };
}

interface ObsidianAppWithInternalPlugins {
  internalPlugins?: {
    getPluginById(id: string): InternalPluginRecord | undefined;
  };
}

interface MomentFactory {
  (date?: Date): { format(pattern: string): string };
  localeData?: () => { firstDayOfWeek(): number };
}

declare global {
  interface Window {
    moment?: MomentFactory;
  }
}

export default class MiniCalendarPlugin extends Plugin {
  settings: MiniCalendarSettings = DEFAULT_SETTINGS;
  private widgets = new Map<HTMLElement, MiniCalendarWidget>();
  private observer: MutationObserver | null = null;
  private mountTimer: number | null = null;

  async onload(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());
    const strings = getStrings();
    this.addCommand({
      id: "show-file-explorer-with-mini-calendar",
      name: strings.commands.showCalendar,
      callback: () => {
        void this.showFileExplorer();
      }
    });
    this.addCommand({
      id: "reset-mini-calendar-to-today",
      name: strings.commands.resetToday,
      callback: () => {
        for (const widget of this.widgets.values()) widget.resetToToday();
      }
    });
    this.addSettingTab(new MiniCalendarSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      this.mountWidgets();
      this.observer = new MutationObserver(() => this.scheduleMount());
      this.observer.observe(document.body, { childList: true, subtree: true });
    });

    this.registerEvent(this.app.workspace.on("layout-change", () => this.scheduleMount()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.refreshWidgets()));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refreshWidgets()));
    this.registerEvent(this.app.vault.on("create", () => this.refreshWidgets()));
    this.registerEvent(this.app.vault.on("delete", () => this.refreshWidgets()));
    this.registerEvent(this.app.vault.on("rename", () => this.refreshWidgets()));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (file instanceof TFile && file.extension === "md") this.refreshWidgets();
    }));
  }

  onunload(): void {
    this.observer?.disconnect();
    if (this.mountTimer !== null) window.clearTimeout(this.mountTimer);
    for (const [leafContent, widget] of this.widgets) {
      widget.destroy();
      leafContent.removeClass("has-mini-calendar");
    }
    this.widgets.clear();
  }

  async openDailyNote(date: Date): Promise<void> {
    try {
      const strings = getStrings();
      if (!this.isDailyNotesEnabled()) {
        new Notice(strings.dailyNotesDisabled);
        return;
      }

      const existing = this.getExistingDailyNote(date);
      if (shouldConfirmDailyNoteCreation(
        date,
        new Date(),
        this.settings.confirmNonTodayCreation,
        Boolean(existing)
      )) {
        const confirmed = await new ConfirmDailyNoteModal(this.app, this.formatDate(date, "YYYY-MM-DD")).confirm();
        if (!confirmed) return;
      }

      const file = existing ?? await this.getOrCreateDailyNote(date);
      await this.app.workspace.getLeaf(false).openFile(file);
    } catch (error) {
      console.error("Mini Calendar failed to open daily note", error);
      new Notice(`无法打开日记：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateSettings(patch: Partial<MiniCalendarSettings>): Promise<void> {
    this.settings = normalizeSettings({ ...this.settings, ...patch });
    await this.saveData(this.settings);
    this.refreshWidgets();
  }

  getFirstDayOfWeek(): number {
    if (this.settings.weekStart === "monday") return 1;
    if (this.settings.weekStart === "sunday") return 0;
    const localeFirstDay = window.moment?.localeData?.().firstDayOfWeek();
    return Number.isInteger(localeFirstDay) && localeFirstDay !== undefined
      ? ((localeFirstDay % 7) + 7) % 7
      : 1;
  }

  getExistingDailyNote(date: Date): TFile | null {
    if (!this.isDailyNotesEnabled()) return null;
    const file = this.app.vault.getAbstractFileByPath(this.getDailyNotePath(date));
    return file instanceof TFile ? file : null;
  }

  private async showFileExplorer(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType("file-explorer")[0];
    if (existing) {
      this.app.workspace.revealLeaf(existing);
      this.scheduleMount();
      return;
    }

    const leaf = this.app.workspace.getLeftLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({ type: "file-explorer", active: true });
    this.app.workspace.revealLeaf(leaf);
    this.scheduleMount();
  }

  getDailyNotePath(date: Date): string {
    const options = this.getDailyNotesOptions();
    const format = options.format?.trim() || "YYYY-MM-DD";
    const fileName = `${this.formatDate(date, format)}.md`;
    return normalizePath(options.folder?.trim() ? `${options.folder}/${fileName}` : fileName);
  }

  async getOrCreateDailyNote(date: Date): Promise<TFile> {
    if (!this.isDailyNotesEnabled()) {
      throw new Error(getStrings().dailyNotesDisabled);
    }
    const path = this.getDailyNotePath(date);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) return existing;
    if (existing) throw new Error(`${path} 已存在，但不是 Markdown 文件`);

    const slash = path.lastIndexOf("/");
    const folder = slash >= 0 ? path.slice(0, slash) : "";
    if (folder) await this.ensureFolder(folder);

    const options = this.getDailyNotesOptions();
    let content = "";
    if (options.template?.trim()) {
      const templatePath = normalizePath(options.template.endsWith(".md") ? options.template : `${options.template}.md`);
      const template = this.app.vault.getAbstractFileByPath(templatePath);
      if (template instanceof TFile) {
        const title = path.slice(slash + 1).replace(/\.md$/iu, "");
        content = replaceTemplateVariables(
          await this.app.vault.cachedRead(template),
          date,
          title,
          (value, pattern) => this.formatDate(value, pattern)
        );
      }
    }

    return this.app.vault.create(path, content);
  }

  private getDailyNotesOptions(): DailyNotesOptions {
    const app = this.app as typeof this.app & ObsidianAppWithInternalPlugins;
    return app.internalPlugins?.getPluginById("daily-notes")?.instance?.options ?? {};
  }

  private isDailyNotesEnabled(): boolean {
    const app = this.app as typeof this.app & ObsidianAppWithInternalPlugins;
    return app.internalPlugins?.getPluginById("daily-notes")?.enabled === true;
  }

  private scheduleMount(): void {
    if (this.mountTimer !== null) return;
    this.mountTimer = window.setTimeout(() => {
      this.mountTimer = null;
      this.mountWidgets();
    }, 80);
  }

  private mountWidgets(): void {
    const liveLeafContents = new Set(
      Array.from(document.querySelectorAll<HTMLElement>('.workspace-leaf-content[data-type="file-explorer"]'))
    );

    for (const [leafContent, widget] of this.widgets) {
      if (!liveLeafContents.has(leafContent) || !leafContent.isConnected) {
        widget.destroy();
        this.widgets.delete(leafContent);
      }
    }

    for (const leafContent of liveLeafContents) {
      if (this.widgets.has(leafContent)) continue;
      const filesContainer = leafContent.querySelector<HTMLElement>(":scope > .nav-files-container");
      if (!filesContainer) continue;
      leafContent.addClass("has-mini-calendar");
      const host = leafContent.createDiv({ cls: "mini-calendar-host" });
      this.widgets.set(leafContent, new MiniCalendarWidget(host, this));
    }
  }

  private refreshWidgets(): void {
    for (const widget of this.widgets.values()) widget.refresh();
  }

  private formatDate(date: Date, pattern: string): string {
    if (window.moment) return window.moment(date).format(pattern);
    if (pattern === "YYYY-MM-DD") {
      const year = String(date.getFullYear()).padStart(4, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    throw new Error("Obsidian 日期组件尚未就绪");
  }

  private async ensureFolder(path: string): Promise<void> {
    let current = "";
    for (const part of normalizePath(path).split("/").filter(Boolean)) {
      current = current ? `${current}/${part}` : part;
      const existing = this.app.vault.getAbstractFileByPath(current);
      if (existing instanceof TFolder) continue;
      if (existing) throw new Error(`${current} 已存在，但不是文件夹`);
      await this.app.vault.createFolder(current);
    }
  }
}

class ConfirmDailyNoteModal extends Modal {
  private resolveConfirmation: ((value: boolean) => void) | null = null;
  private resolved = false;

  constructor(app: MiniCalendarPlugin["app"], private readonly dateLabel: string) {
    super(app);
  }

  confirm(): Promise<boolean> {
    return new Promise(resolve => {
      this.resolveConfirmation = resolve;
      this.open();
    });
  }

  onOpen(): void {
    const strings = getStrings();
    this.setTitle(strings.confirm.title);
    this.contentEl.createEl("p", { text: strings.confirm.message(this.dateLabel) });
    new Setting(this.contentEl)
      .addButton(button => button
        .setButtonText(strings.confirm.cancel)
        .onClick(() => this.finish(false)))
      .addButton(button => {
        button.setButtonText(strings.confirm.create).setCta();
        button.onClick(() => this.finish(true));
      });
  }

  onClose(): void {
    this.contentEl.empty();
    if (!this.resolved) this.finish(false, false);
  }

  private finish(value: boolean, close = true): void {
    if (this.resolved) return;
    this.resolved = true;
    this.resolveConfirmation?.(value);
    this.resolveConfirmation = null;
    if (close) this.close();
  }
}
