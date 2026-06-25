export interface CalendarDateLike {
  getDay(): number;
  getFullYear(): number;
  getMonth(): number;
  getDate(): number;
}

export function startOfWeek(date: Date, firstDay = 1): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedFirstDay = ((firstDay % 7) + 7) % 7;
  const offset = (result.getDay() - normalizedFirstDay + 7) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

export function startOfMonday(date: Date): Date {
  return startOfWeek(date, 1);
}

export function addDays(date: Date, count: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + count);
  return result;
}

export function getWeek(date: Date, firstDay = 1): Date[] {
  const weekStart = startOfWeek(date, firstDay);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function sameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function toIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function hasUnfinishedTask(markdown: string): boolean {
  return /^(?:\s*>\s*)*\s*[-*+]\s+\[ \]\s+/imu.test(markdown);
}

export function getIsoWeekNumber(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const weekday = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
}

export function getTodayWeekdayIndex(today: Date, firstDay: number): number {
  const normalizedFirstDay = ((firstDay % 7) + 7) % 7;
  return (today.getDay() - normalizedFirstDay + 7) % 7;
}

export function shouldConfirmDailyNoteCreation(
  date: Date,
  today: Date,
  confirmationEnabled: boolean,
  noteExists: boolean
): boolean {
  return confirmationEnabled && !noteExists && !sameDay(date, today);
}

export function replaceTemplateVariables(
  template: string,
  date: Date,
  title: string,
  formatDate: (date: Date, format: string) => string,
  now = new Date()
): string {
  return template
    .replace(/\{\{\s*date(?::([^}]+))?\s*\}\}/giu, (_match, format: string | undefined) =>
      formatDate(date, format?.trim() || "YYYY-MM-DD"))
    .replace(/\{\{\s*time(?::([^}]+))?\s*\}\}/giu, (_match, format: string | undefined) =>
      formatDate(now, format?.trim() || "HH:mm"))
    .replace(/\{\{\s*title\s*\}\}/giu, title);
}
