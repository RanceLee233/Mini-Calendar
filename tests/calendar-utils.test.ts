import assert from "node:assert/strict";
import test from "node:test";
import {
  getIsoWeekNumber,
  getTodayWeekdayIndex,
  getWeek,
  hasUnfinishedTask,
  replaceTemplateVariables,
  shouldConfirmDailyNoteCreation,
  startOfMonday,
  startOfWeek,
  toIsoDate
} from "../src/calendar-utils";

test("周视图始终从周一开始", () => {
  assert.equal(toIsoDate(startOfMonday(new Date(2026, 5, 22))), "2026-06-22");
  assert.equal(toIsoDate(startOfMonday(new Date(2026, 5, 28))), "2026-06-22");
  assert.deepEqual(getWeek(new Date(2026, 5, 22)).map(toIsoDate), [
    "2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26", "2026-06-27", "2026-06-28"
  ]);
});

test("支持周日或周一作为每周第一天", () => {
  assert.equal(toIsoDate(startOfWeek(new Date(2026, 5, 24), 1)), "2026-06-22");
  assert.equal(toIsoDate(startOfWeek(new Date(2026, 5, 24), 0)), "2026-06-21");
});

test("ISO 周号跨年计算正确", () => {
  assert.equal(getIsoWeekNumber(new Date(2026, 0, 1)), 1);
  assert.equal(getIsoWeekNumber(new Date(2026, 11, 31)), 53);
});

test("只确认创建非当日日记", () => {
  const today = new Date(2026, 5, 22);
  assert.equal(shouldConfirmDailyNoteCreation(today, today, true, false), false);
  assert.equal(shouldConfirmDailyNoteCreation(new Date(2026, 5, 21), today, true, false), true);
  assert.equal(shouldConfirmDailyNoteCreation(new Date(2026, 5, 23), today, true, false), true);
  assert.equal(shouldConfirmDailyNoteCreation(new Date(2026, 5, 23), today, false, false), false);
  assert.equal(shouldConfirmDailyNoteCreation(new Date(2026, 5, 23), today, true, true), false);
});

test("日期格式使用本地年月日，不受 UTC 偏移影响", () => {
  assert.equal(toIsoDate(new Date(2026, 0, 2, 23, 59)), "2026-01-02");
});

test("识别未完成任务，不误判已完成任务", () => {
  assert.equal(hasUnfinishedTask("- [ ] 待办"), true);
  assert.equal(hasUnfinishedTask("> - [ ] 引用里的待办"), true);
  assert.equal(hasUnfinishedTask("- [x] 完成\n普通文本 [ ]"), false);
});

test("计算今天在周表头中的列索引", () => {
  // 2026-06-25 是周四
  const thursday = new Date(2026, 5, 25);
  assert.equal(getTodayWeekdayIndex(thursday, 1), 3); // 周一起始：周四是第 4 列
  assert.equal(getTodayWeekdayIndex(thursday, 0), 4); // 周日起始：周四是第 5 列
  // 周日本身：firstDay=monday 时应落在最后一列
  const sunday = new Date(2026, 5, 28);
  assert.equal(getTodayWeekdayIndex(sunday, 1), 6);
  assert.equal(getTodayWeekdayIndex(sunday, 0), 0);
  // 今天即 firstDay 那一天
  const monday = new Date(2026, 5, 22);
  assert.equal(getTodayWeekdayIndex(monday, 1), 0);
});

test("替换 Daily Notes 常用模板变量", () => {
  const result = replaceTemplateVariables(
    "日期={{date}} 周={{date:dddd}} 标题={{title}} 时间={{time:HH:mm}}",
    new Date(2026, 5, 22),
    "20260622",
    (_date, format) => ({ "YYYY-MM-DD": "2026-06-22", dddd: "星期一", "HH:mm": "15:00" })[format] ?? format,
    new Date(2026, 5, 22, 15, 0)
  );
  assert.equal(result, "日期=2026-06-22 周=星期一 标题=20260622 时间=15:00");
});
