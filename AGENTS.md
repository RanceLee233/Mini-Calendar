# AGENTS.md

请使用中文与用户沟通。

## 项目目标

Mini Calendar 是一个保持克制的 Obsidian 社区插件：在 Obsidian 原生文件列表底部嵌入紧凑的单周日历，并与核心 Daily Notes 配置联动。

- 不依赖 Notebook Navigator。
- 不创建独立日历标签页。
- 目录树在上方滚动，日历固定在同一文件列表页底部。
- 新安装默认使用七张独立圆角彩虹日期卡片；关闭彩虹后周末使用薄荷绿。
- 日期必须单击一次就在主编辑区打开；文件列表获得焦点时也不能要求双击或替换侧边栏。
- 保持离线、无遥测、无广告、无自行更新机制。
- 最低支持 Obsidian 1.8.7；使用新 API 时必须同步更新 `minAppVersion` 并通过官方 ESLint 规则。
- Notebook Navigator 仅为界面灵感来源；不得复制或派生其 GPL 源代码。

## 实现原则

修改前依次评估：无需新增代码、标准 Web API、Obsidian 原生 API、现有依赖、最小可维护实现。

- 避免无明确需求的抽象、依赖、配置和脚手架。
- 优先使用 Obsidian CSS 变量和 DOM helper，不写不安全的 `innerHTML`。
- 文件操作使用 Vault API；路径必须经过 `normalizePath()`。
- 新增监听器、定时器、Observer 或 DOM 节点时，必须在插件卸载时清理。
- 不得把密钥、令牌、个人路径或本地验收产物提交到仓库。
- 不得破坏 Obsidian 原生文件列表的滚动、切换和卸载恢复行为。

## 当前结构

- `src/main.ts`：插件生命周期、文件列表挂载、Daily Notes 路径与创建逻辑。
- `src/calendar-widget.ts`：日历 DOM、导航、点击和状态指示。
- `src/calendar-utils.ts`：纯日期、任务和模板工具函数。
- `src/settings.ts`：设置默认值、数据规范化和设置页。
- `src/about-modal.ts`：关于作者弹窗，提供 GitHub 与博客入口。
- `src/i18n.ts`：中文与英文界面文案、月份和星期标签。
- `styles.css`：仅使用插件 class 与 Obsidian 主题变量。
- `assets/mini-calendar-zh.webp`、`assets/mini-calendar-en.webp`：README 双语位置示意截图。
- `tests/`：纯逻辑测试。

## 当前设置与行为

- `weekStart`：`locale`（默认）、`monday`、`sunday`。
- `confirmNonTodayCreation`：默认开启；仅创建缺失的过去或未来日记时确认。今天和已有日记不确认。
- `showWeekNumber`：默认关闭；开启后显示 ISO 周号。
- `rainbowDates`：新安装默认开启；按可见列从左到右使用红、橙、黄、绿、青、蓝、紫。
- 设置页底部提供“关于我 / About the author”，展示作者简介、GitHub 主页与博客。
- 关闭彩虹后，周六和周日使用薄荷绿：浅色主题参考 `#E8F5E9`，暗色主题参考 `#498F6F` 混合色。
- 核心 Daily Notes 未启用时必须提示用户，不得静默在仓库根目录创建文件。
- 缺失日记使用核心 Daily Notes 的目录、文件名格式和模板；`{{date}}` 使用所选日期，`{{time}}` 使用创建时刻。
- 打开日记时使用 `workspace.getMostRecentLeaf(workspace.rootSplit)`，不得退回依赖当前 active leaf 的 `getLeaf(false)`。

## 验证闭环

任何非文档改动完成后必须执行：

```bash
npm run verify
```

`npm run verify` 必须包含 `eslint-plugin-obsidianmd` 官方推荐规则，发布前不得存在 Error 或 Warning。

涉及 Obsidian 运行时或界面的改动还必须：

1. 构建并同步到测试仓库。
2. 多仓库环境下显式指定：`obsidian vault="OBSIDIAN 仓库" plugin:reload id=mini-calendar`。
3. 检查 `obsidian dev:errors`。
4. 用 DOM 检查确认：不存在 `mini-calendar-view` 独立标签，`.mini-calendar-host` 的父节点是 `data-type="file-explorer"`。
5. 将文件列表设为 active leaf，单击日期一次，确认主工作区立即打开日记且文件列表仍存在。
6. 验证今天不确认、过去/未来缺失日记确认、已有日记不确认、关闭确认选项后不确认。
7. 验证上一周、下一周、返回今天、周一/周日起始、ISO 周号和彩虹开关。
8. 验证浅色和暗色主题；彩虹关闭时检查薄荷绿周末。
9. 只有获得用户许可后才能截图；验收后清理含私人界面的全屏截图。

不得在测试中覆盖用户已有日记。若必须验证创建流程，只能使用确认不存在的远期临时日期，并立即清理新建文件。

## Git 与发布

- 保留用户已有改动，不执行破坏性 Git 命令。
- 提交前运行 `git diff --check`、密钥扫描和 `npm run verify`。
- `package.json`、`manifest.json`、`versions.json` 的版本必须一致。
- GitHub Release 标签必须与 `manifest.json` 的版本完全一致，不能带 `v` 前缀。
- Release 必须上传 `main.js`、`manifest.json`、`styles.css`。
- README 必须保留中英文、隐私说明、安装说明、MIT 许可证链接和 Notebook Navigator 致谢。
- README 顶部必须先提供中文和英文各一至两句功能摘要，避免中文用户需要跨过完整英文段落才能理解插件用途。
- README 双语截图应展示“文件列表在上、日历固定在下”的位置关系；目录名称和其他私人信息必须先打码，正文区域使用空白新标签页；优先存入仓库 `assets/`，不依赖个人图床。
- README 截图使用指向本仓库 Raw 文件的绝对 URL，避免社区插件页面无法解析相对资源路径。
- 默认视觉必须与 Notebook Navigator 保持明显差异：独立卡片、卡片间距、统一圆角和彩虹日期；不得恢复为相连日期条带的一比一外观。
- Obsidian 市场首次提交前检查插件 ID 唯一、描述不超过 250 字符、以句号结尾，且不得包含冗余单词 “Obsidian”。

## 功能边界

新增功能前先证明它服务于“紧凑单周日历 + Daily Notes 导航”这一核心目标。

- 已有核心功能：中英文本地化、每周起始日、非当日创建确认、可选 ISO 周号、彩虹日期、薄荷绿周末、键盘焦点与 aria-label。
- 推荐的小功能：键盘导航、无障碍细化和不扩张产品边界的主题适配。
- 默认拒绝的扩张：事件管理、在线日历同步、年度/月度大视图、任务管理器、习惯追踪、账号系统、网络服务。
- 设置项必须有明确用户价值，提供安全默认值，并补充迁移、测试和 README 文档。
