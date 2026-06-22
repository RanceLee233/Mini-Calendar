import { TFile, setIcon } from "obsidian";
import type MiniCalendarPlugin from "./main";
import { addDays, getIsoWeekNumber, getWeek, hasUnfinishedTask, sameDay, toIsoDate } from "./calendar-utils";
import { formatMonthYear, getStrings, getWeekdayLabels } from "./i18n";

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
    const strings = getStrings();
    root.setAttr("aria-label", strings.calendarLabel);

    const calendar = root.createDiv({ cls: "mini-calendar" });
    calendar.toggleClass("is-rainbow", this.plugin.settings.rainbowDates);
    const header = calendar.createDiv({ cls: "mini-calendar__header" });
    const title = header.createDiv({ cls: "mini-calendar__title" });
    title.createSpan({
      cls: "mini-calendar__month",
      text: formatMonthYear(this.cursor)
    });
    if (this.plugin.settings.showWeekNumber) {
      const week = getIsoWeekNumber(this.cursor);
      title.createSpan({
        cls: "mini-calendar__week-number",
        text: `W${week}`,
        attr: { "aria-label": strings.weekNumberAria(week) }
      });
    }

    const actions = header.createDiv({ cls: "mini-calendar__actions" });
    this.createIconButton(actions, "chevron-left", strings.previousWeek, () => {
      this.cursor = addDays(this.cursor, -7);
      this.render();
    });
    const todayButton = actions.createEl("button", {
      cls: "mini-calendar__today",
      text: strings.today,
      attr: { type: "button", "aria-label": strings.todayAria }
    });
    todayButton.addEventListener("click", () => this.resetToToday());
    this.createIconButton(actions, "chevron-right", strings.nextWeek, () => {
      this.cursor = addDays(this.cursor, 7);
      this.render();
    });

    const weekdayRow = calendar.createDiv({ cls: "mini-calendar__weekdays", attr: { "aria-hidden": "true" } });
    const firstDay = this.plugin.getFirstDayOfWeek();
    for (const weekday of getWeekdayLabels(firstDay)) {
      weekdayRow.createSpan({ text: weekday });
    }

    const dayRow = calendar.createDiv({ cls: "mini-calendar__days", attr: { role: "grid" } });
    const activeFile = this.plugin.app.workspace.getActiveFile();
    const today = new Date();
    const visibleFiles: TFile[] = [];

    const weekDates = getWeek(this.cursor, firstDay);
    const isWeekend = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;
    for (const [index, date] of weekDates.entries()) {
      const file = this.plugin.getExistingDailyNote(date);
      const iso = toIsoDate(date);
      const classes = ["mini-calendar__day"];
      if (isWeekend(date)) {
        classes.push("is-weekend");
        if (index === 0 || !isWeekend(weekDates[index - 1])) classes.push("is-weekend-start");
        if (index === weekDates.length - 1 || !isWeekend(weekDates[index + 1])) classes.push("is-weekend-end");
      }
      if (sameDay(date, today)) classes.push("is-today");
      if (file) classes.push("has-note");
      if (file && this.taskState.get(file.path)) classes.push("has-unfinished-task");
      if (file && activeFile?.path === file.path) classes.push("is-active-note");

      const button = dayRow.createEl("button", {
        cls: classes.join(" "),
        attr: {
          type: "button",
          role: "gridcell",
          "aria-label": strings.dayAria(iso, Boolean(file)),
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
