import { TFile, setIcon } from "obsidian";
import type MiniCalendarPlugin from "./main";
import { addDays, getWeek, hasUnfinishedTask, sameDay, toIsoDate } from "./calendar-utils";

export class MiniCalendarWidget {
  private cursor = new Date();
  private taskState = new Map<string, boolean>();
  private refreshTimer: number | null = null;

  constructor(
    private readonly hostEl: HTMLElement,
    private readonly plugin: MiniCalendarPlugin
  ) {
    this.render();
  }

  destroy(): void {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.hostEl.remove();
  }

  refresh(): void {
    this.render();
  }

  resetToToday(): void {
    this.cursor = new Date();
    this.render();
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.render();
    }, 120);
  }

  private render(): void {
    const root = this.hostEl;
    root.empty();
    root.setAttr("aria-label", "迷你日历");

    const calendar = root.createDiv({ cls: "mini-calendar" });
    const header = calendar.createDiv({ cls: "mini-calendar__header" });
    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    header.createDiv({
      cls: "mini-calendar__month",
      text: `${monthNames[this.cursor.getMonth()]} ${this.cursor.getFullYear()}`
    });

    const actions = header.createDiv({ cls: "mini-calendar__actions" });
    this.createIconButton(actions, "chevron-left", "上一周", () => {
      this.cursor = addDays(this.cursor, -7);
      this.render();
    });
    const todayButton = actions.createEl("button", {
      cls: "mini-calendar__today",
      text: "今天",
      attr: { type: "button", "aria-label": "返回今天" }
    });
    todayButton.addEventListener("click", () => this.resetToToday());
    this.createIconButton(actions, "chevron-right", "下一周", () => {
      this.cursor = addDays(this.cursor, 7);
      this.render();
    });

    const weekdayRow = calendar.createDiv({ cls: "mini-calendar__weekdays", attr: { "aria-hidden": "true" } });
    for (const weekday of ["一", "二", "三", "四", "五", "六", "日"]) {
      weekdayRow.createSpan({ text: weekday });
    }

    const dayRow = calendar.createDiv({ cls: "mini-calendar__days", attr: { role: "grid" } });
    const activeFile = this.plugin.app.workspace.getActiveFile();
    const today = new Date();
    const visibleFiles: TFile[] = [];

    for (const [index, date] of getWeek(this.cursor).entries()) {
      const path = this.plugin.getDailyNotePath(date);
      const abstractFile = this.plugin.app.vault.getAbstractFileByPath(path);
      const file = abstractFile instanceof TFile ? abstractFile : null;
      const iso = toIsoDate(date);
      const classes = ["mini-calendar__day"];
      if (index >= 5) classes.push("is-weekend");
      if (sameDay(date, today)) classes.push("is-today");
      if (file) classes.push("has-note");
      if (file && this.taskState.get(file.path)) classes.push("has-unfinished-task");
      if (file && activeFile?.path === file.path) classes.push("is-active-note");

      const button = dayRow.createEl("button", {
        cls: classes.join(" "),
        attr: {
          type: "button",
          role: "gridcell",
          "aria-label": `${iso}${file ? "，已有日记" : "，创建日记"}`,
          "data-date": iso
        }
      });
      button.createSpan({ cls: "mini-calendar__day-number", text: String(date.getDate()) });
      const indicators = button.createSpan({ cls: "mini-calendar__indicators", attr: { "aria-hidden": "true" } });
      if (file) indicators.createSpan({ cls: "mini-calendar__note-dot" });
      if (file && this.taskState.get(file.path)) indicators.createSpan({ cls: "mini-calendar__task-dot" });
      button.addEventListener("click", () => void this.plugin.openDailyNote(date));
      if (file) visibleFiles.push(file);
    }

    void this.updateTaskState(visibleFiles);
  }

  private createIconButton(parent: HTMLElement, icon: string, label: string, onClick: () => void): void {
    const button = parent.createEl("button", {
      cls: "mini-calendar__icon-button",
      attr: { type: "button", "aria-label": label }
    });
    setIcon(button, icon);
    button.addEventListener("click", onClick);
  }

  private async updateTaskState(files: TFile[]): Promise<void> {
    const next = new Map<string, boolean>();
    await Promise.all(files.map(async (file) => {
      try {
        next.set(file.path, hasUnfinishedTask(await this.plugin.app.vault.cachedRead(file)));
      } catch {
        next.set(file.path, false);
      }
    }));

    let changed = next.size !== this.taskState.size;
    if (!changed) {
      for (const [path, state] of next) {
        if (this.taskState.get(path) !== state) {
          changed = true;
          break;
        }
      }
    }
    this.taskState = next;
    if (changed) this.scheduleRefresh();
  }
}
