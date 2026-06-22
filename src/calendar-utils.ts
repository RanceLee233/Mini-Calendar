export interface CalendarDateLike {
  getDay(): number;
  getFullYear(): number;
  getMonth(): number;
  getDate(): number;
}

export function startOfMonday(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

export function addDays(date: Date, count: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + count);
  return result;
}

export function getWeek(date: Date): Date[] {
  const monday = startOfMonday(date);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
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
