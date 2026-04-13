import "./main.scss";
import "@luzmo/analytics-components-kit/filters";
import "@luzmo/analytics-components-kit/item-option-panel";
import "@luzmo/embed";
import "@luzmo/lucero/button";
import EditorJS, {
  type BlockToolConstructable,
  type ToolboxConfigEntry,
} from "@editorjs/editorjs";
import EditorjsList from "@editorjs/list";

import Button from "./block-tools/button.ts";
import Callout from "./block-tools/callout.ts";
import Header from "./block-tools/header.ts";
import LuzmoKeyMetrics from "./block-tools/luzmo-key-metrics.ts";
import LuzmoVizItem from "./block-tools/luzmo-viz-item.ts";
import { clearBlocksStorage, report, saveBlocksToStorage } from "./report.ts";

interface ReportHeader {
  subtitle?: string;
  title: string;
}

interface ReportFooter {
  text: string;
}

const createHeaderElement = (
  headerDiv: HTMLDivElement,
  header: ReportHeader
): void => {
  const title = document.createElement("h1");
  title.textContent = header.title;
  headerDiv.append(title);

  if (header.subtitle) {
    const subtitle = document.createElement("div");
    subtitle.textContent = header.subtitle;
    headerDiv.append(subtitle);
  }
};

const createHeader = (header: ReportHeader): void => {
  const headerDiv = document.createElement("div");
  headerDiv.id = "header";
  headerDiv.classList.add("header");
  createHeaderElement(headerDiv, header);

  const editorElement = document.querySelector("#editor");
  if (editorElement?.parentNode && !document.querySelector("#header")) {
    editorElement.parentNode.insertBefore(headerDiv, editorElement);
  }
};

const createFooter = (footer: ReportFooter): void => {
  const footerDiv = document.createElement("div");
  footerDiv.id = "footer";
  footerDiv.classList.add("footer");

  const footerText = document.createElement("p");
  footerText.innerHTML = footer.text;
  footerDiv.append(footerText);

  const editorElement = document.querySelector("#editor");
  if (editorElement?.parentNode && !document.querySelector("#footer")) {
    editorElement.parentNode.append(footerDiv);
  }
};

const createEditorTools = () => ({
  button: Button,
  callout: Callout,
  header: Header,
  list: {
    class: EditorjsList as unknown as BlockToolConstructable,
    config: { defaultStyle: "unordered" },
    inlineToolbar: true,
    toolbox: [
      (EditorjsList.toolbox as ToolboxConfigEntry[])[0],
      (EditorjsList.toolbox as ToolboxConfigEntry[])[1],
    ],
  },
  luzmoKeyMetrics: {
    class: LuzmoKeyMetrics as unknown as BlockToolConstructable,
    config: {
      appServer: report.appServer,
      authKey: report.authKey,
      authToken: report.authToken,
      contentsVersion: report.contentsVersion,
      datasetsDataFields: report.datasetsDataFields,
      language: report.language,
    },
  },
  luzmoVizItem: {
    class: LuzmoVizItem as unknown as BlockToolConstructable,
    config: {
      appServer: report.appServer,
      authKey: report.authKey,
      authToken: report.authToken,
      contentsVersion: report.contentsVersion,
      datasetsDataFields: report.datasetsDataFields,
      language: report.language,
    },
  },
});

const initializeEditor = (): EditorJS =>
  new EditorJS({
    data: report.body,
    holder: "editor",
    tools: createEditorTools(),
  });

const setupSaveButton = (editor: EditorJS): HTMLElement => {
  const saveButton = document.createElement("luzmo-button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", async () => {
    const outputData = await editor.save();
    // Save blocks to localStorage
    const blocksToSave = outputData.blocks.map((block) => ({
      data: block.data,
      type: block.type,
    }));
    saveBlocksToStorage(blocksToSave);

    // Visual feedback
    const originalText = saveButton.textContent;
    saveButton.textContent = "Saved!";
    setTimeout(() => {
      saveButton.textContent = originalText;
    }, 2000);

    window.dispatchEvent(
      new CustomEvent("editor-saved", { detail: outputData })
    );
  });
  return saveButton;
};

const setupToggleButton = (editor: EditorJS): HTMLElement => {
  const toggleModeButton = document.createElement("luzmo-button");
  toggleModeButton.setAttribute("quiet", "true");
  let isReadOnly = false;

  const updateToggleButton = (): void => {
    toggleModeButton.textContent = isReadOnly
      ? "Switch to Edit"
      : "Switch to Read-Only";
  };

  updateToggleButton();

  toggleModeButton.addEventListener("click", async () => {
    try {
      await editor.readOnly.toggle();
      isReadOnly = !isReadOnly;
      updateToggleButton();
    } catch {
      // Handle error silently - could add error notification here
    }
  });

  return toggleModeButton;
};

const setupResetButton = (): HTMLElement => {
  const resetButton = document.createElement("luzmo-button");
  resetButton.textContent = "Reset";
  resetButton.addEventListener("click", () => {
    clearBlocksStorage();
    window.location.reload();
  });
  return resetButton;
};

const setupButtons = (editor: EditorJS): void => {
  const toggleModeButton = setupToggleButton(editor);
  const saveButton = setupSaveButton(editor);
  const resetButton = setupResetButton();

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("editor-button-container");
  buttonContainer.append(toggleModeButton, saveButton, resetButton);

  document.body.append(buttonContainer);
};

const initializeApp = (): void => {
  const editor = initializeEditor();
  createHeader(report.header);
  createFooter(report.footer);
  setupButtons(editor);
};

document.addEventListener("DOMContentLoaded", initializeApp);
