import { App, PluginSettingTab, Setting } from "obsidian";
import { getStrings } from "./i18n";
import type MiniCalendarPlugin from "./main";

export type WeekStartSetting = "locale" | "monday" | "sunday";

export interface MiniCalendarSettings {
  confirmNonTodayCreation: boolean;
  rainbowDates: boolean;
  showWeekNumber: boolean;
  weekStart: WeekStartSetting;
}

export const DEFAULT_SETTINGS: MiniCalendarSettings = {
  confirmNonTodayCreation: true,
  rainbowDates: true,
  showWeekNumber: false,
  weekStart: "locale"
};

export function normalizeSettings(value: unknown): MiniCalendarSettings {
  const loaded = value && typeof value === "object" ? value as Partial<MiniCalendarSettings> : {};
  const weekStart = loaded.weekStart === "monday" || loaded.weekStart === "sunday" || loaded.weekStart === "locale"
    ? loaded.weekStart
    : DEFAULT_SETTINGS.weekStart;

  return {
    confirmNonTodayCreation: typeof loaded.confirmNonTodayCreation === "boolean"
      ? loaded.confirmNonTodayCreation
      : DEFAULT_SETTINGS.confirmNonTodayCreation,
    rainbowDates: typeof loaded.rainbowDates === "boolean"
      ? loaded.rainbowDates
      : DEFAULT_SETTINGS.rainbowDates,
    showWeekNumber: typeof loaded.showWeekNumber === "boolean"
      ? loaded.showWeekNumber
      : DEFAULT_SETTINGS.showWeekNumber,
    weekStart
  };
}

export class MiniCalendarSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: MiniCalendarPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    const strings = getStrings();
    containerEl.empty();

    new Setting(containerEl)
      .setName(strings.settings.weekStart.name)
      .setDesc(strings.settings.weekStart.description)
      .addDropdown(dropdown => dropdown
        .addOption("locale", strings.settings.weekStart.options.locale)
        .addOption("monday", strings.settings.weekStart.options.monday)
        .addOption("sunday", strings.settings.weekStart.options.sunday)
        .setValue(this.plugin.settings.weekStart)
        .onChange(async value => {
          if (value !== "locale" && value !== "monday" && value !== "sunday") return;
          await this.plugin.updateSettings({ weekStart: value });
        }));

    new Setting(containerEl)
      .setName(strings.settings.confirmNonToday.name)
      .setDesc(strings.settings.confirmNonToday.description)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.confirmNonTodayCreation)
        .onChange(async value => {
          await this.plugin.updateSettings({ confirmNonTodayCreation: value });
        }));

    new Setting(containerEl)
      .setName(strings.settings.showWeekNumber.name)
      .setDesc(strings.settings.showWeekNumber.description)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showWeekNumber)
        .onChange(async value => {
          await this.plugin.updateSettings({ showWeekNumber: value });
        }));

    new Setting(containerEl)
      .setName(strings.settings.rainbowDates.name)
      .setDesc(strings.settings.rainbowDates.description)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.rainbowDates)
        .onChange(async value => {
          await this.plugin.updateSettings({ rainbowDates: value });
        }));
  }
}
