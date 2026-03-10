import "./callout.scss";
import type { API } from "@editorjs/editorjs";
import {
  luzmoAlertOutline,
  luzmoClearCircleOutline,
  luzmoInfoCircleOutline,
} from "@luzmo/icons";
import { toSvgString } from "../utils/icons";

export type CalloutType = "danger" | "info" | "primary" | "warning";

export interface CalloutData {
  text: string;
  title: string;
  type?: CalloutType;
}

export interface CalloutConfig {
  defaultType?: CalloutType;
  placeholder?: {
    text?: string;
    title?: string;
  };
}

interface ConstructorArgs {
  api: API;
  config: CalloutConfig;
  data: Partial<CalloutData>;
  readOnly: boolean;
}

const VALID_TYPES = new Set<CalloutType>([
  "danger",
  "info",
  "primary",
  "warning",
]);

const isCalloutData = (data: unknown): data is CalloutData => {
  if (data === null || typeof data !== "object") {
    return false;
  }
  const calloutData = data as Partial<CalloutData>;
  return calloutData.title !== undefined || calloutData.text !== undefined;
};

const validateCalloutData = (blockData: CalloutData): boolean =>
  blockData.title.trim() !== "" || blockData.text.trim() !== "";

export default class Callout {
  private _data: CalloutData;
  private _element: HTMLElement;
  private _settings: CalloutConfig;
  private _textElement!: HTMLElement;
  private _titleElement!: HTMLElement;
  private api: API;
  private readOnly: boolean;

  constructor({ api, config, data, readOnly }: ConstructorArgs) {
    this.api = api;
    this.readOnly = readOnly;
    this._settings = config;
    this._data = this.normalizeData(data);
    this._element = this.createCalloutElement();
  }

  private get _CSS() {
    return {
      block: this.api.styles.block,
      danger: "luzmo-callout--danger",
      info: "luzmo-callout--info",
      primary: "luzmo-callout--primary",
      text: "luzmo-callout__text",
      title: "luzmo-callout__title",
      warning: "luzmo-callout--warning",
      wrapper: "luzmo-callout",
    };
  }

  normalizeData(data: Partial<CalloutData>): CalloutData {
    const newData: CalloutData = {
      text: "",
      title: "",
      type: this._settings.defaultType || "primary",
    };

    if (isCalloutData(data)) {
      newData.title = data.title || "";
      newData.text = data.text || "";
      if (data.type && VALID_TYPES.has(data.type)) {
        newData.type = data.type;
      }
    }

    return newData;
  }

  private createTitleElement(): HTMLElement {
    const titleElement = document.createElement("div");
    titleElement.classList.add(this._CSS.title);
    titleElement.contentEditable = this.readOnly ? "false" : "true";
    titleElement.innerHTML = this._data.title;
    titleElement.dataset.placeholder = this.api.i18n.t(
      this._settings.placeholder?.title || "Enter title..."
    );
    return titleElement;
  }

  private createTextElement(): HTMLElement {
    const textElement = document.createElement("div");
    textElement.classList.add(this._CSS.text);
    textElement.contentEditable = this.readOnly ? "false" : "true";
    textElement.innerHTML = this._data.text;
    textElement.dataset.placeholder = this.api.i18n.t(
      this._settings.placeholder?.text || "Enter text..."
    );
    return textElement;
  }

  createCalloutElement(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.classList.add(this._CSS.wrapper);
    if (this._data.type) {
      wrapper.classList.add(this._CSS[this._data.type]);
    }

    this._titleElement = this.createTitleElement();
    this._textElement = this.createTextElement();

    wrapper.append(this._titleElement, this._textElement);
    return wrapper;
  }

  render(): HTMLElement {
    return this._element;
  }

  renderSettings() {
    const types: { icon: string; label: string; type: CalloutType }[] = [
      {
        icon: toSvgString(luzmoInfoCircleOutline),
        label: "Info",
        type: "info",
      },
      {
        icon: toSvgString(luzmoAlertOutline),
        label: "Warning",
        type: "warning",
      },
      {
        icon: toSvgString(luzmoClearCircleOutline),
        label: "Danger",
        type: "danger",
      },
    ];

    return types.map((typeConfig) => ({
      closeOnActivate: true,
      icon: typeConfig.icon,
      isActive: this._data.type === typeConfig.type,
      label: this.api.i18n.t(typeConfig.label),
      onActivate: () => this.setType(typeConfig.type),
      render: () => document.createElement("div"),
    }));
  }

  setType(type: CalloutType): void {
    this._element.classList.remove(
      this._CSS.danger,
      this._CSS.info,
      this._CSS.primary,
      this._CSS.warning
    );
    this._element.classList.add(this._CSS[type]);
    this._data.type = type;
  }

  merge(data: CalloutData): void {
    if (data.title) {
      this._titleElement.insertAdjacentHTML("beforeend", data.title);
    }
    if (data.text) {
      this._textElement.insertAdjacentHTML("beforeend", data.text);
    }
  }

  static validate(blockData: CalloutData): boolean {
    return validateCalloutData(blockData);
  }

  save(): CalloutData {
    return {
      text: this._textElement.innerHTML,
      title: this._titleElement.innerHTML,
      type: this._data.type,
    };
  }

  static get conversionConfig() {
    return { export: "text", import: "text" };
  }

  static get sanitize() {
    return {
      text: {
        a: { href: true },
        b: true,
        br: true,
        em: true,
        i: true,
        li: true,
        ol: true,
        p: true,
        strong: true,
        u: true,
        ul: true,
      },
      title: { b: true, em: true, i: true, strong: true, u: true },
      type: false,
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  get data(): CalloutData {
    return {
      text: this._textElement.innerHTML,
      title: this._titleElement.innerHTML,
      type: this._data.type,
    };
  }

  set data(data: CalloutData) {
    this._data = this.normalizeData(data);

    if (this._titleElement) {
      this._titleElement.innerHTML = this._data.title || "";
    }
    if (this._textElement) {
      this._textElement.innerHTML = this._data.text || "";
    }
    if (this._element && this._data.type) {
      this._element.classList.remove(
        this._CSS.danger,
        this._CSS.info,
        this._CSS.primary,
        this._CSS.warning
      );
      this._element.classList.add(this._CSS[this._data.type]);
    }
  }

  static get toolbox() {
    return {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M5 7v10M9 17h7M9 12h4M9 7h10"  stroke-linecap="round" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      title: "Callout",
    };
  }
}
