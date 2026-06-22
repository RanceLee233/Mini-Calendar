# AGENTS.md

请使用中文与用户沟通。

## 项目目标

Mini Calendar 是一个保持克制的 Obsidian 社区插件：在 Obsidian 原生文件列表底部嵌入紧凑的单周日历，并与核心 Daily Notes 配置联动。

- 不依赖 Notebook Navigator。
- 不创建独立日历标签页。
- 目录树在上方滚动，日历固定在同一文件列表页底部。
- 新安装默认使用七张独立圆角彩虹日期卡片；关闭彩虹后周末使用薄荷绿。
- 保持离线、无遥测、无广告、无自行更新机制。
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
- `styles.css`：仅使用插件 class 与 Obsidian 主题变量。
- `tests/`：纯逻辑测试。

## 验证闭环

任何非文档改动完成后必须执行：

```bash
npm run verify
```

涉及 Obsidian 运行时或界面的改动还必须：

1. 构建并同步到测试仓库。
2. `obsidian plugin:reload id=mini-calendar`。
3. 检查 `obsidian dev:errors`。
4. 用 DOM 检查确认：不存在 `mini-calendar-view` 独立标签，`.mini-calendar-host` 的父节点是 `data-type="file-explorer"`。
5. 验证已有日记打开、缺失日记创建、上一周/下一周和返回今天。
6. 只有获得用户许可后才能截图；验收后清理临时截图。

不得在测试中覆盖用户已有日记。若必须验证创建流程，只能使用确认不存在的远期临时日期，并立即清理新建文件。

## Git 与发布

- 保留用户已有改动，不执行破坏性 Git 命令。
- 提交前运行 `git diff --check`、密钥扫描和 `npm run verify`。
- `package.json`、`manifest.json`、`versions.json` 的版本必须一致。
- GitHub Release 标签必须与 `manifest.json` 的版本完全一致，不能带 `v` 前缀。
- Release 必须上传 `main.js`、`manifest.json`、`styles.css`。
- README 必须保留中英文、隐私说明、安装说明、MIT 许可证链接和 Notebook Navigator 致谢。
- Obsidian 市场首次提交前检查插件 ID 唯一、描述不超过 250 字符且以句号结尾。

## 功能边界

新增功能前先证明它服务于“紧凑单周日历 + Daily Notes 导航”这一核心目标。

- 推荐的小功能：本地化、每周起始日、创建前确认、可选周号、键盘与无障碍改进。
- 默认拒绝的扩张：事件管理、在线日历同步、年度/月度大视图、任务管理器、习惯追踪、账号系统、网络服务。
- 设置项必须有明确用户价值，提供安全默认值，并补充迁移、测试和 README 文档。
