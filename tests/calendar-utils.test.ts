import assert from "node:assert/strict";
import test from "node:test";
import { getWeek, hasUnfinishedTask, replaceTemplateVariables, startOfMonday, toIsoDate } from "../src/calendar-utils";

test("周视图始终从周一开始", () => {
  assert.equal(toIsoDate(startOfMonday(new Date(2026, 5, 22))), "2026-06-22");
  assert.equal(toIsoDate(startOfMonday(new Date(2026, 5, 28))), "2026-06-22");
  assert.deepEqual(getWeek(new Date(2026, 5, 22)).map(toIsoDate), [
    "2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26", "2026-06-27", "2026-06-28"
  ]);
});

test("日期格式使用本地年月日，不受 UTC 偏移影响", () => {
  assert.equal(toIsoDate(new Date(2026, 0, 2, 23, 59)), "2026-01-02");
});

test("识别未完成任务，不误判已完成任务", () => {
  assert.equal(hasUnfinishedTask("- [ ] 待办"), true);
  assert.equal(hasUnfinishedTask("> - [ ] 引用里的待办"), true);
  assert.equal(hasUnfinishedTask("- [x] 完成\n普通文本 [ ]"), false);
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
