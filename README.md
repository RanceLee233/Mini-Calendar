# Mini Calendar

[English](#english) · [中文](#中文)

## English

Mini Calendar adds a compact one-week calendar below Obsidian's built-in file explorer. The folder tree stays scrollable above the calendar, so both remain available in the same sidebar tab.

![Mini Calendar in English](assets/mini-calendar-en.png)

### Features

- Embeds directly below Obsidian's built-in file explorer—no separate calendar tab.
- Shows one week at a time, from Monday through Sunday.
- Lets you follow the locale default, Monday, or Sunday as the first day of the week.
- Navigate to the previous week, next week, or return to today.
- Click a date to open its daily note or create it when missing.
- Optionally shows the ISO week number in the header.
- By default, asks before creating past or future notes; today's note is created without confirmation.
- Uses the folder, filename format, and template configured by Obsidian's core Daily Notes plugin.
- Shows a solid dot when a daily note exists.
- Shows an outlined dot when that daily note contains unfinished tasks.
- Adapts to Obsidian light and dark themes using native CSS variables.
- Works on desktop and mobile without network access.

### Requirements

- Obsidian 1.5.0 or later.
- Enable the built-in **File explorer** core plugin.
- For customized daily note paths and templates, configure the built-in **Daily notes** core plugin.

If Daily Notes has no custom format, Mini Calendar uses `YYYY-MM-DD.md`.

Mini Calendar asks you to enable the Daily Notes core plugin instead of silently creating notes in the vault root when it is disabled.

### Installation

#### From Obsidian Community Plugins

Once the plugin is accepted into the Obsidian Community directory:

1. Open **Settings → Community plugins → Browse**.
2. Search for **Mini Calendar**.
3. Select **Install**, then **Enable**.

#### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the matching [GitHub release](https://github.com/RanceLee233/Mini-Calendar/releases).
2. Create `<vault>/.obsidian/plugins/mini-calendar/`.
3. Copy the three files into that folder.
4. Reload Obsidian and enable **Mini Calendar** under **Community plugins**.

### Usage

Open Obsidian's built-in File explorer. The calendar appears at the bottom of the same sidebar tab, below the folder tree.

- Select a date to open or create its daily note.
- Use the arrow buttons to move by one week.
- Select **Today** to return to the current week.

### Settings

- **Start week on:** Locale default, Monday, or Sunday.
- **Confirm past and future notes:** Enabled by default. This never prompts for today's note or an existing note.
- **Show week number:** Shows the ISO week number in the header. Disabled by default.

### Privacy and security

Mini Calendar works entirely offline. It does not make network requests, collect telemetry, display advertisements, access files outside your vault, or include an auto-update mechanism.

### Acknowledgements

The compact calendar presentation was inspired by [Notebook Navigator](https://github.com/johansan/notebook-navigator), created by Johan Sanneblad. Thank you for the thoughtful calendar design and for making it available to the Obsidian community.

Mini Calendar is an independent implementation built from scratch for Obsidian's built-in File explorer. It is not affiliated with, endorsed by, or derived from Notebook Navigator's source code.

### Development

```bash
npm install
npm run verify
```

To sync a build into a development vault:

```bash
OBSIDIAN_PLUGIN_DEV_DIR="/path/to/vault/.obsidian/plugins/mini-calendar" npm run build
```

### License

[MIT](LICENSE)

---

## 中文

Mini Calendar 在 Obsidian 原生文件列表底部嵌入一个紧凑的单周日历。目录树在上方正常滚动，日历固定在下方，两者共用同一个侧边栏标签页。

![Mini Calendar 中文界面](assets/mini-calendar-zh.png)

### 功能

- 直接嵌入 Obsidian 原生文件列表底部，不创建独立日历标签页。
- 显示从周一到周日的单周视图。
- 每周第一天可选择跟随系统、周一或周日。
- 支持上一周、下一周和返回今天。
- 点击日期可打开对应日记；不存在时自动创建。
- 可选择在标题中显示 ISO 周号。
- 默认仅在创建过去或未来日期的日记前确认；创建今天的日记无需确认。
- 遵循 Obsidian 核心「日记」插件配置的目录、文件名格式和模板。
- 实心圆点表示该日期已有日记。
- 空心圆点表示该日记存在未完成任务。
- 使用 Obsidian 原生 CSS 变量，自动适配明暗主题。
- 支持桌面端和移动端，全程离线工作。

### 使用要求

- Obsidian 1.5.0 或更高版本。
- 启用 Obsidian 核心「文件列表」插件。
- 如需自定义日记目录、文件名和模板，请配置核心「日记」插件。

如果核心「日记」插件没有设置日期格式，Mini Calendar 默认使用 `YYYY-MM-DD.md`。

如果核心「日记」插件未启用，Mini Calendar 会提示用户启用，不会静默在仓库根目录创建日记。

### 安装

#### 从 Obsidian 社区插件市场安装

插件通过 Obsidian 社区审核后：

1. 打开「设置 → 第三方插件 → 浏览」。
2. 搜索 **Mini Calendar**。
3. 点击「安装」，然后启用插件。

#### 手动安装

1. 从对应的 [GitHub Release](https://github.com/RanceLee233/Mini-Calendar/releases) 下载 `main.js`、`manifest.json` 和 `styles.css`。
2. 创建 `<仓库>/.obsidian/plugins/mini-calendar/` 文件夹。
3. 将三个文件复制到该文件夹。
4. 重启或重新加载 Obsidian，在「第三方插件」中启用 **Mini Calendar**。

### 使用方法

打开 Obsidian 原生「文件列表」，日历会显示在同一侧边栏标签页的目录树下方。

- 点击日期可打开或创建对应日记。
- 点击左右箭头可切换上一周或下一周。
- 点击「今天」可返回当前周。

### 设置

- **每周开始于：** 跟随系统、周一或周日。
- **确认创建非当日日记：** 默认开启；今天和已有日记始终不会弹出确认。
- **显示周号：** 在标题中显示 ISO 周号，默认关闭。

### 隐私与安全

Mini Calendar 完全离线运行，不发起网络请求、不收集遥测数据、不显示广告、不访问 Obsidian 仓库以外的文件，也不包含自行更新机制。

### 致谢

本插件的紧凑日历展示方式受到 Johan Sanneblad 开发的 [Notebook Navigator](https://github.com/johansan/notebook-navigator) 启发。感谢它为 Obsidian 社区提供了出色的日历设计与使用灵感。

Mini Calendar 是针对 Obsidian 原生文件列表从零独立实现的插件，与 Notebook Navigator 不存在隶属或官方关联，也没有使用或派生自 Notebook Navigator 的源代码。

### 开发

```bash
npm install
npm run verify
```

同步构建到开发仓库：

```bash
OBSIDIAN_PLUGIN_DEV_DIR="/path/to/vault/.obsidian/plugins/mini-calendar" npm run build
```

### 许可证

[MIT](LICENSE)
