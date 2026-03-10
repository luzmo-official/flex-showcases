import "./header.scss";
import type { API, BlockTune, PasteEvent } from "@editorjs/editorjs";

const IconH2 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10 19 9.5 19 12C19 13.9771 16.0684 13.9997 16.0012 16.8981C15.9999 16.9533 16.0448 17 16.1 17L19.3 17"/></svg>`;
const IconH3 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10.5 16.8323 10 17.6 10C18.3677 10 19.5 10.311 19.5 11.5C19.5 12.5315 18.7474 12.9022 18.548 12.9823C18.5378 12.9864 18.5395 13.0047 18.5503 13.0063C18.8115 13.0456 20 13.3065 20 14.8C20 16 19.5 17 17.8 17C17.8 17 16 17 16 16.3"/></svg>`;
const IconH4 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18 10L15.2834 14.8511C15.246 14.9178 15.294 15 15.3704 15C16.8489 15 18.7561 15 20.2 15M19 17C19 15.7187 19 14.8813 19 13.6"/></svg>`;
const IconHeading = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 7L9 12M9 17V12M9 12L15 12M15 7V12M15 17L15 12"/></svg>`;

export interface HeaderData {
  level: number;
  text: string;
}

export interface HeaderConfig {
  defaultLevel?: number;
  levels?: number[];
  placeholder?: string;
}

interface Level {
  description: string;
  number: number;
  svg: string;
  tag: string;
}

interface ConstructorArgs {
  api: API;
  config: HeaderConfig;
  data: Partial<HeaderData>;
  readOnly: boolean;
}

const isHeaderData = (data: unknown): data is HeaderData =>
  data !== null &&
  typeof data === "object" &&
  "text" in data &&
  typeof (data as HeaderData).text === "string";

const validateHeaderData = (blockData: HeaderData): boolean =>
  blockData.text.trim() !== "";

const determinePasteLevel = (tagName: string, defaultLevel: number): number => {
  switch (tagName) {
    case "H1":
    case "H2": {
      return 2;
    }
    case "H3": {
      return 3;
    }
    case "H4": {
      return 4;
    }
    default: {
      return defaultLevel;
    }
  }
};

const findClosestLevel = (levels: number[], targetLevel: number): number => {
  const [firstLevel] = levels;
  let closestLevel = firstLevel;
  let minDiff = Math.abs(closestLevel - targetLevel);

  for (const level of levels) {
    const diff = Math.abs(level - targetLevel);
    if (diff < minDiff) {
      minDiff = diff;
      closestLevel = level;
    }
  }

  return closestLevel;
};

export default class Header {
  private _data: HeaderData;
  private _element: HTMLHeadingElement;
  private _settings: HeaderConfig;
  private api: API;
  private readOnly: boolean;

  constructor({ api, config, data, readOnly }: ConstructorArgs) {
    this.api = api;
    this.readOnly = readOnly;
    this._settings = config;
    this._data = this.normalizeData(data);
    this._element = this.getTag();
  }

  private get _CSS() {
    return {
      block: this.api.styles.block,
      wrapper: "luzmo-report-header",
    };
  }

  normalizeData(data: Partial<HeaderData>): HeaderData {
    const newData: HeaderData = { level: this.defaultLevel.number, text: "" };

    if (isHeaderData(data)) {
      newData.text = data.text || "";
      if (
        data.level !== undefined &&
        !Number.isNaN(Number.parseInt(String(data.level), 10))
      ) {
        newData.level = Number.parseInt(String(data.level), 10);
      }
    } else if (data.text) {
      newData.text = data.text;
    }

    return newData;
  }

  render(): HTMLHeadingElement {
    return this._element;
  }

  renderSettings(): BlockTune[] {
    return this.levels.map((level) => ({
      closeOnActivate: true,
      icon: level.svg,
      isActive: this.currentLevel.number === level.number,
      label: this.api.i18n.t(`${level.description}`),
      onActivate: () => this.setLevel(level.number),
      render: () => document.createElement("div"),
    }));
  }

  setLevel(level: number): void {
    this.data = { level, text: this.data.text };
  }

  merge(data: HeaderData): void {
    this._element.insertAdjacentHTML("beforeend", data.text);
  }

  static validate(blockData: HeaderData): boolean {
    return validateHeaderData(blockData);
  }

  save(toolsContent: HTMLHeadingElement): HeaderData {
    return {
      level: this.currentLevel.number,
      text: toolsContent.innerHTML,
    };
  }

  static get conversionConfig() {
    return { export: "text", import: "text" };
  }

  static get sanitize() {
    return { level: false, text: {} };
  }

  static get isReadOnlySupported() {
    return true;
  }

  get data(): HeaderData {
    this._data.text = this._element.innerHTML;
    this._data.level = this.currentLevel.number;
    return this._data;
  }

  set data(data: HeaderData) {
    this._data = this.normalizeData(data);

    if (data.level !== undefined && this._element.parentNode) {
      const newHeader = this.getTag();
      newHeader.innerHTML = this._element.innerHTML;
      this._element.parentNode.replaceChild(newHeader, this._element);
      this._element = newHeader;
    }

    if (data.text !== undefined) {
      this._element.innerHTML = this._data.text || "";
    }
  }

  getTag(): HTMLHeadingElement {
    const tag = document.createElement(
      this.currentLevel.tag
    ) as HTMLHeadingElement;
    tag.innerHTML = this._data.text || "";
    tag.classList.add(this._CSS.wrapper);
    tag.contentEditable = this.readOnly ? "false" : "true";
    tag.dataset.placeholder = this.api.i18n.t(this._settings.placeholder || "");
    return tag;
  }

  get currentLevel(): Level {
    const level = this.levels.find(
      (levelItem) => levelItem.number === this._data.level
    );
    return level ?? this.defaultLevel;
  }

  get defaultLevel(): Level {
    if (this._settings.defaultLevel) {
      const userSpecified = this.levels.find(
        (levelItem) => levelItem.number === this._settings.defaultLevel
      );
      if (userSpecified) {
        return userSpecified;
      }
    }
    return this.levels[0];
  }

  get levels(): Level[] {
    const availableLevels = [
      { description: "Section title", number: 2, svg: IconH2, tag: "H2" },
      { description: "Subsection title", number: 3, svg: IconH3, tag: "H3" },
      { description: "Normal title", number: 4, svg: IconH4, tag: "H4" },
    ];

    if (this._settings.levels) {
      return availableLevels.filter((l) =>
        this._settings.levels?.includes(l.number)
      );
    }
    return availableLevels;
  }

  onPaste(event: PasteEvent): void {
    const { detail } = event;

    if ("data" in detail) {
      const content = detail.data as HTMLElement;
      let level = determinePasteLevel(
        content.tagName,
        this.defaultLevel.number
      );

      if (this._settings.levels) {
        level = findClosestLevel(this._settings.levels, level);
      }

      this.data = { level, text: content.innerHTML };
    }
  }

  static get pasteConfig() {
    return { tags: ["H1", "H2", "H3", "H4", "H5", "H6"] };
  }

  static get toolbox() {
    return { icon: IconHeading, title: "Heading" };
  }
}
