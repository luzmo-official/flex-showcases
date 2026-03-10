import "./button.scss";
import "@luzmo/lucero/button";
import "@luzmo/lucero/field-label";
import "@luzmo/lucero/text-field";
import type {
  LuzmoButton,
  LuzmoFieldLabel,
  LuzmoHelpText,
  LuzmoTextField,
} from "@luzmo/lucero";
import type { API } from "@editorjs/editorjs";
import { luzmoMarker } from "@luzmo/icons";

import { toSvgString } from "../utils/icons";

interface ButtonConfig {
  css?: Record<string, string>;
  linkValidation?: (text: string) => boolean;
  textValidation?: (text: string) => boolean;
}

interface ConstructorArgs {
  api: API;
  config?: ButtonConfig;
  data: Partial<ButtonData>;
  readOnly: boolean;
}

interface ButtonData {
  link: string;
  text: string;
}

interface ButtonNodes {
  button: (LuzmoButton & HTMLElement) | null;
  buttonPlaceholder: HTMLElement | null;
  buttonTextInput: (LuzmoTextField & HTMLElement) | null;
  buttonUrlInput: (LuzmoTextField & HTMLElement) | null;
  container: HTMLElement | null;
  inputHolder: HTMLElement | null;
  setButton: (LuzmoButton & HTMLElement) | null;
  wrapper: HTMLElement | null;
}

const createTextField = (
  inputId: string,
  placeholder: string,
  helpText: string,
  api: API,
  readOnly: boolean
): LuzmoTextField & HTMLElement => {
  const input = document.createElement("luzmo-text-field") as LuzmoTextField &
    HTMLElement;
  input.id = inputId;
  if (readOnly) {
    input.readonly = true;
  }
  input.placeholder = api.i18n.t(placeholder);

  const help = document.createElement("luzmo-help-text") as LuzmoHelpText &
    HTMLElement;
  help.setAttribute("slot", "negative-help-text");
  help.textContent = api.i18n.t(helpText);
  input.append(help);

  return input;
};

const createFieldContainer = (
  labelText: string,
  inputId: string,
  api: API
): HTMLElement => {
  const container = document.createElement("div");
  const label = document.createElement("luzmo-field-label") as LuzmoFieldLabel &
    HTMLElement;
  label.textContent = api.i18n.t(labelText);
  label.for = inputId;
  container.append(label);
  return container;
};

export default class Button {
  CSS: Record<string, string>;
  api: API;
  linkValidation: (text: string) => boolean;
  nodes: ButtonNodes;
  readOnly: boolean;
  textValidation: (text: string) => boolean;
  private _data: ButtonData = { link: "", text: "" };

  static get toolbox() {
    return {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
        <rect width="22" height="12" x="1" y="6" stroke="currentColor" stroke-width="2" rx="4"/>
        <path d="M7 12h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      title: "Button",
    };
  }

  static get tunes() {
    return [{ icon: toSvgString(luzmoMarker), name: "edit_mode", title: "Edit Button" }];
  }

  renderSettings() {
    return Button.tunes.map((tune) => ({
      icon: tune.icon,
      label: this.api.i18n.t(tune.title),
      name: tune.name,
      onActivate: () => {
        this.data = {
          link: this.nodes.buttonUrlInput?.value || "",
          text: this.nodes.buttonTextInput?.value || "",
        };
        this.show(false);
      },
    }));
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get enableLineBreaks() {
    return false;
  }

  set data(data: Partial<ButtonData>) {
    this._data = {
      link: this.api.sanitizer.clean(data.link || "", Button.sanitize),
      text: this.api.sanitizer.clean(data.text || "", Button.sanitize),
    };
  }

  get data(): ButtonData {
    return this._data;
  }

  validate(): boolean {
    return this._data.link !== "" && this._data.text !== "";
  }

  save(): ButtonData {
    return this._data;
  }

  static get sanitize() {
    return { link: false, text: false };
  }

  validateLinkUrl(text: string): boolean {
    if (!this.nodes.buttonUrlInput) {
      return false;
    }

    try {
      const url = new URL(text);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        this.nodes.buttonUrlInput.invalid = true;
        return false;
      }
      this.nodes.buttonUrlInput.invalid = false;
      return true;
    } catch {
      this.nodes.buttonUrlInput.invalid = true;
      return false;
    }
  }

  validateButtonText(text: string): boolean {
    if (!this.nodes.buttonTextInput) {
      return false;
    }
    if (text === "") {
      this.nodes.buttonTextInput.invalid = true;
      return false;
    }
    this.nodes.buttonTextInput.invalid = false;
    return true;
  }

  constructor({ api, config, data, readOnly }: ConstructorArgs) {
    this.api = api;
    this.readOnly = readOnly;
    this.nodes = {
      button: null,
      buttonPlaceholder: null,
      buttonTextInput: null,
      buttonUrlInput: null,
      container: null,
      inputHolder: null,
      setButton: null,
      wrapper: null,
    };

    this.CSS = {
      baseClass: this.api.styles.block,
      btn: "button__btn",
      buttonPlaceholder: "button-container__buttonPlaceholder",
      container: "button-container",
      hide: "hide",
      input: "button-container__input",
      inputHolder: "button-container__inputHolder",
      inputLink: "button-container__input--link",
      inputText: "button-container__input--text",
      setButton: "button-container__setButton",
      ...config?.css,
    };
    this.linkValidation =
      config?.linkValidation || this.validateLinkUrl.bind(this);
    this.textValidation =
      config?.textValidation || this.validateButtonText.bind(this);
    this.data = data;
  }

  private setupContainer(): void {
    this.nodes.wrapper = document.createElement("div");
    this.nodes.wrapper.classList.add(this.CSS.baseClass);
    this.nodes.container = document.createElement("div");
    this.nodes.container.classList.add(this.CSS.container);
  }

  render(): HTMLElement {
    this.setupContainer();
    this.nodes.inputHolder = this.renderEditElements();
    this.nodes.buttonPlaceholder = this.renderButton();

    if (this.nodes.container) {
      this.nodes.container.append(
        this.nodes.inputHolder,
        this.nodes.buttonPlaceholder
      );
    }

    if (this._data.link !== "") {
      this.init();
      this.show(true);
    }

    if (this.nodes.wrapper && this.nodes.container) {
      this.nodes.wrapper.append(this.nodes.container);
    }

    return this.nodes.wrapper as HTMLElement;
  }

  private setupSetButtonHandler(): void {
    if (!this.nodes.setButton) {
      return;
    }

    this.nodes.setButton.addEventListener("click", () => {
      if (!this.linkValidation(this.nodes.buttonUrlInput?.value || "")) {
        return;
      }
      if (!this.textValidation(this.nodes.buttonTextInput?.value || "")) {
        return;
      }
      this.data = {
        link: this.nodes.buttonUrlInput?.value || "",
        text: this.nodes.buttonTextInput?.value || "",
      };
      this.show(true);
    });
  }

  private createTextFieldInput(): void {
    if (!this.nodes.inputHolder) {
      return;
    }
    const textFieldContainer = createFieldContainer(
      "Button Text",
      "button-text-input",
      this.api
    );
    this.nodes.buttonTextInput = createTextField(
      "button-text-input",
      "Enter button text",
      "Enter a valid button text",
      this.api,
      this.readOnly
    );
    textFieldContainer.append(this.nodes.buttonTextInput);
    this.nodes.inputHolder.append(textFieldContainer);
  }

  private createUrlFieldInput(): void {
    if (!this.nodes.inputHolder) {
      return;
    }
    const urlFieldContainer = createFieldContainer(
      "Link Url",
      "button-url-input",
      this.api
    );
    this.nodes.buttonUrlInput = createTextField(
      "button-url-input",
      "Enter link url",
      "Enter a valid link url",
      this.api,
      this.readOnly
    );
    this.nodes.buttonUrlInput.type = "url";
    urlFieldContainer.append(this.nodes.buttonUrlInput);
    this.nodes.inputHolder.append(urlFieldContainer);
  }

  private createSetButton(): void {
    if (!this.nodes.inputHolder) {
      return;
    }
    this.nodes.setButton = document.createElement(
      "luzmo-button"
    ) as LuzmoButton & HTMLElement;
    this.nodes.setButton.classList.add(this.CSS.setButton);
    this.nodes.setButton.textContent = this.api.i18n.t("Set");
    this.setupSetButtonHandler();
    this.nodes.inputHolder.append(this.nodes.setButton);
  }

  renderEditElements(): HTMLElement {
    this.nodes.inputHolder = document.createElement("div");
    this.nodes.inputHolder.classList.add(this.CSS.inputHolder);

    this.createTextFieldInput();
    this.createUrlFieldInput();
    this.createSetButton();

    return this.nodes.inputHolder;
  }

  init(): void {
    if (this.nodes.buttonTextInput && this.nodes.buttonUrlInput) {
      this.nodes.buttonTextInput.value = this._data.text;
      this.nodes.buttonUrlInput.value = this._data.link;
    }
  }

  show(visible: boolean): void {
    if (!this.nodes.button) {
      return;
    }
    this.nodes.button.textContent = this._data.text;
    this.nodes.button.href = this._data.link;
    this.changeState(visible);
  }

  renderButton(): HTMLElement {
    this.nodes.button = document.createElement("luzmo-button") as LuzmoButton &
      HTMLElement;
    this.nodes.button.textContent = this._data.text;
    this.nodes.button.href = this._data.link;
    this.nodes.button.size = "l";
    this.nodes.button.target = "_blank";
    this.nodes.button.rel = "nofollow noindex noreferrer";

    const buttonPlaceholder = document.createElement("div");
    buttonPlaceholder.classList.add(this.CSS.hide, this.CSS.buttonPlaceholder);
    this.nodes.button.textContent = this.api.i18n.t("Default Button");
    buttonPlaceholder.append(this.nodes.button);
    return buttonPlaceholder;
  }

  changeState(visible: boolean): void {
    if (!this.nodes.inputHolder || !this.nodes.buttonPlaceholder) {
      return;
    }

    if (visible) {
      this.nodes.inputHolder.classList.add(this.CSS.hide);
      this.nodes.buttonPlaceholder.classList.remove(this.CSS.hide);
    } else {
      this.nodes.inputHolder.classList.remove(this.CSS.hide);
      this.nodes.buttonPlaceholder.classList.add(this.CSS.hide);
    }
  }
}
