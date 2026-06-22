import { getLanguage } from "obsidian";

export interface MiniCalendarStrings {
  about: {
    blog: string;
    github: string;
    intro: string;
    title: string;
    version: (version: string) => string;
  };
  calendarLabel: string;
  commands: {
    resetToday: string;
    showCalendar: string;
  };
  confirm: {
    cancel: string;
    create: string;
    message: (date: string) => string;
    title: string;
  };
  dailyNotesDisabled: string;
  dayAria: (date: string, hasNote: boolean) => string;
  nextWeek: string;
  previousWeek: string;
  settings: {
    about: { button: string; description: string; name: string };
    confirmNonToday: { description: string; name: string };
    rainbowDates: { description: string; name: string };
    showWeekNumber: { description: string; name: string };
    weekStart: {
      description: string;
      name: string;
      options: { locale: string; monday: string; sunday: string };
    };
  };
  today: string;
  todayAria: string;
  weekNumberAria: (week: number) => string;
}

const en: MiniCalendarStrings = {
  about: {
    blog: "Author's blog",
    github: "GitHub profile",
    intro: "Mini Calendar is made by RanceLee, who writes about Obsidian, practical AI workflows, and independent software.",
    title: "About Mini Calendar",
    version: version => `Version ${version}`
  },
  calendarLabel: "Mini calendar",
  commands: {
    resetToday: "Return to today",
    showCalendar: "Show file explorer with mini calendar"
  },
  confirm: {
    cancel: "Cancel",
    create: "Create",
    message: date => `Create a daily note for ${date}?`,
    title: "Create daily note"
  },
  dailyNotesDisabled: "Enable the Daily notes core plugin before creating or opening notes from Mini Calendar.",
  dayAria: (date, hasNote) => `${date}, ${hasNote ? "open daily note" : "create daily note"}`,
  nextWeek: "Next week",
  previousWeek: "Previous week",
  settings: {
    about: {
      button: "About the author",
      description: "Learn about RanceLee and find the author's GitHub profile and blog.",
      name: "About"
    },
    confirmNonToday: {
      description: "Ask before creating a daily note for a past or future date. Today's note never requires confirmation.",
      name: "Confirm past and future notes"
    },
    rainbowDates: {
      description: "Give the seven date cards distinct low-saturation rainbow backgrounds.",
      name: "Rainbow dates"
    },
    showWeekNumber: {
      description: "Show the ISO week number in the calendar header.",
      name: "Show week number"
    },
    weekStart: {
      description: "Choose the first day shown in each calendar week.",
      name: "Start week on",
      options: { locale: "Locale default", monday: "Monday", sunday: "Sunday" }
    }
  },
  today: "Today",
  todayAria: "Return to today",
  weekNumberAria: week => `ISO week ${week}`
};

const zh: MiniCalendarStrings = {
  about: {
    blog: "作者博客",
    github: "GitHub 主页",
    intro: "Mini Calendar 由 RanceLee 独立开发。我长期分享 Obsidian 教程、AI 实践与效率工具，也提供系统化 Obsidian 教程和开箱即用的预设仓库。欢迎通过作者博客了解更多内容，或在 GitHub 查看我的开源项目。",
    title: "关于 Mini Calendar",
    version: version => `当前版本：${version}`
  },
  calendarLabel: "迷你日历",
  commands: {
    resetToday: "回到今天",
    showCalendar: "显示文件列表和迷你日历"
  },
  confirm: {
    cancel: "取消",
    create: "创建",
    message: date => `要创建 ${date} 的日记吗？`,
    title: "创建日记"
  },
  dailyNotesDisabled: "请先启用 Obsidian 核心「日记」插件，再通过迷你日历打开或创建日记。",
  dayAria: (date, hasNote) => `${date}，${hasNote ? "打开日记" : "创建日记"}`,
  nextWeek: "下一周",
  previousWeek: "上一周",
  settings: {
    about: {
      button: "关于我",
      description: "了解作者 RanceLee，访问 GitHub 主页和个人博客。",
      name: "关于"
    },
    confirmNonToday: {
      description: "创建过去或未来日期的日记前询问；创建今天的日记始终无需确认。",
      name: "确认创建非当日日记"
    },
    rainbowDates: {
      description: "为一周七个日期卡片设置不同的低饱和彩虹背景色。",
      name: "彩虹日期"
    },
    showWeekNumber: {
      description: "在日历标题中显示 ISO 周号。",
      name: "显示周号"
    },
    weekStart: {
      description: "选择日历每周显示的第一天。",
      name: "每周开始于",
      options: { locale: "跟随系统", monday: "周一", sunday: "周日" }
    }
  },
  today: "今天",
  todayAria: "返回今天",
  weekNumberAria: week => `ISO 第 ${week} 周`
};

export function isChineseUi(): boolean {
  return getLanguage().toLowerCase().startsWith("zh");
}

export function getStrings(): MiniCalendarStrings {
  return isChineseUi() ? zh : en;
}

export function getCalendarLocale(): string {
  return isChineseUi() ? "zh-CN" : "en-US";
}

export function formatMonthYear(date: Date): string {
  if (isChineseUi()) {
    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export function getWeekdayLabels(firstDay: number): string[] {
  const labels = isChineseUi()
    ? ["日", "一", "二", "三", "四", "五", "六"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return Array.from({ length: 7 }, (_, index) => labels[(firstDay + index) % 7]);
}
