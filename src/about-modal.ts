import { Modal } from "obsidian";
import { getStrings } from "./i18n";
import type MiniCalendarPlugin from "./main";

const GITHUB_URL = "https://github.com/RanceLee233";
const BLOG_URL = "https://blog.discoverlabs.ac.cn/";

export class AboutModal extends Modal {
  constructor(private readonly plugin: MiniCalendarPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    const strings = getStrings();
    const { contentEl, titleEl } = this;
    titleEl.setText(strings.about.title);
    contentEl.empty();
    contentEl.addClass("mini-calendar-about");

    contentEl.createEl("p", {
      cls: "mini-calendar-about__intro",
      text: strings.about.intro
    });
    contentEl.createEl("p", {
      cls: "mini-calendar-about__version",
      text: strings.about.version(this.plugin.manifest.version)
    });

    const linksEl = contentEl.createDiv({ cls: "mini-calendar-about__links" });
    this.appendLink(linksEl, strings.about.github, GITHUB_URL);
    this.appendLink(linksEl, strings.about.blog, BLOG_URL);
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private appendLink(parent: HTMLElement, label: string, url: string): void {
    parent.createEl("a", {
      cls: "mini-calendar-about__link",
      text: label,
      attr: {
        href: url,
        target: "_blank",
        rel: "noopener noreferrer"
      }
    });
  }
}
