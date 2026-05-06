import "./luzmo-key-metrics.scss";
import "@luzmo/analytics-components-kit/filters";
import "@luzmo/analytics-components-kit/item-option-panel";
import "@luzmo/analytics-components-kit/item-grid";
import "@luzmo/analytics-components-kit/item-slot-picker-panel";
import "@luzmo/lucero/overlay";
import type { API } from "@editorjs/editorjs";
import type {
  LuzmoFilters,
  LuzmoItemOptionPanel,
} from "@luzmo/analytics-components-kit";
import type {
  ActionGroup,
  LuzmoItemGridItemActionsMenu,
} from "@luzmo/analytics-components-kit/item-grid";
import type { LuzmoItemSlotPickerPanel } from "@luzmo/analytics-components-kit/item-slot-picker-panel";
import { getTheme } from "@luzmo/analytics-components-kit/utils";
import type {
  ItemThemeConfig,
  LuzmoEmbedVizItem,
} from "@luzmo/embed";
import {
  luzmoColumns,
  luzmoCog,
  luzmoFilterOutline,
  luzmoTable,
} from "@luzmo/icons";
import type { LuzmoOverlay, LuzmoPopover } from "@luzmo/lucero";

import { DATASETS_DATA_FIELDS, type DatasetDataFields } from "../data";
import type { FilterGroup } from "../utils/filters";
import { toSvgString } from "../utils/icons";
import { CONTENTS_VERSION } from "../report";

export interface KeyMetricSlotContent {
  aggregationFunc?: string;
  columnId?: string;
  currency?: string;
  datasetId?: string;
  format?: string;
  label?: Record<string, string>;
  subtype?: string;
  type?: string;
}

export interface KeyMetricSlot {
  content: KeyMetricSlotContent[];
  name: string;
}

export interface KeyMetricOptions {
  evolutionGraphDisplay?: string;
  numberFontSize?: number;
  titleFontSize?: number;
}

export interface KeyMetricItem {
  filters?: unknown[];
  options: KeyMetricOptions;
  rawFilters?: FilterGroup[] | null;
  slots: KeyMetricSlot[];
  type: string;
  version?: string;
}

export interface LuzmoKeyMetricsData {
  columns: number;
  content: KeyMetricItem[];
  rows: number;
}

export interface LuzmoKeyMetricsConfig {
  appServer?: string;
  authKey?: string;
  authToken?: string;
  contentsVersion?: string;
  datasetsDataFields?: DatasetDataFields[];
  language?: string;
}

interface ConstructorArgs {
  api: API;
  config?: LuzmoKeyMetricsConfig;
  data: Partial<LuzmoKeyMetricsData>;
  readOnly?: boolean;
}

interface GridLayoutPreset {
  columns: number;
  label: string;
  rows: number;
}

const GRID_LAYOUTS: GridLayoutPreset[] = [
  { columns: 1, label: "1 × 1", rows: 1 },
  { columns: 1, label: "1 × 2", rows: 2 },
  { columns: 2, label: "2 × 1", rows: 1 },
  { columns: 2, label: "2 × 2", rows: 2 },
];

const DEFAULT_COLUMNS = 2;
const DEFAULT_ROWS = 1;

const DEFAULT_METRIC: KeyMetricItem = {
  options: {
    evolutionGraphDisplay: "none",
    numberFontSize: 32,
    titleFontSize: 16,
  },
  slots: [{ content: [], name: "measure" }],
  type: "evolution-number",
};

const METRIC_ACTIONS: ActionGroup[] = [
  {
    actions: [
      {
        action: "edit-data",
        icon: luzmoTable,
        label: "Edit data",
        tooltip: "Data",
        type: "toggle",
      },
      {
        action: "item-options",
        icon: luzmoCog,
        label: "Edit options",
        tooltip: "Options",
        type: "toggle",
      },
      {
        action: "filters",
        icon: luzmoFilterOutline,
        label: "Edit filters",
        tooltip: "Filters",
        type: "toggle",
      },
    ],
    type: "group",
  },
];

const MOBILE_BREAKPOINT = 600;

const cloneDefaultMetric = (): KeyMetricItem => ({
  ...DEFAULT_METRIC,
  slots: DEFAULT_METRIC.slots.map((s) => ({ ...s, content: [...s.content] })),
});

const normalizeMetricsData = (
  data: Partial<LuzmoKeyMetricsData>,
): LuzmoKeyMetricsData => {
  const columns = data.columns ?? DEFAULT_COLUMNS;
  const rows = data.rows ?? DEFAULT_ROWS;
  const totalNeeded = columns * rows;

  let content: KeyMetricItem[];
  if (data.content && Array.isArray(data.content) && data.content.length > 0) {
    content = [...data.content];
  } else {
    content = Array.from({ length: totalNeeded }, () => cloneDefaultMetric());
  }

  while (content.length < totalNeeded) {
    content.push(cloneDefaultMetric());
  }
  if (content.length > totalNeeded) {
    content = content.slice(0, totalNeeded);
  }

  return { columns, content, rows };
};

const getOptimalPlacement = (
  triggerElement: HTMLElement,
  popoverWidth = 400,
): "bottom" | "left" | "right" | "top" => {
  const rect = triggerElement.getBoundingClientRect();
  const { innerHeight: viewportHeight, innerWidth: viewportWidth } = window;

  const spaceBottom = viewportHeight - rect.bottom;
  const spaceTop = rect.top;

  if (viewportWidth <= MOBILE_BREAKPOINT) {
    return spaceBottom >= spaceTop ? "bottom" : "top";
  }

  const spaceRight = viewportWidth - rect.right;
  const spaceLeft = rect.left;

  if (spaceRight >= popoverWidth) {
    return "right";
  }
  if (spaceLeft >= popoverWidth) {
    return "left";
  }
  if (spaceBottom >= 300) {
    return "bottom";
  }
  if (spaceTop >= 300) {
    return "top";
  }
  return "bottom";
};

const getVerticalPlacement = (
  triggerElement: HTMLElement,
): "bottom" | "top" => {
  const rect = triggerElement.getBoundingClientRect();
  const spaceBottom = window.innerHeight - rect.bottom;
  const spaceTop = rect.top;
  return spaceBottom >= spaceTop ? "bottom" : "top";
};

const createOverlayForCard = (
  cardElement: HTMLElement,
): LuzmoOverlay & HTMLElement => {
  const overlay = document.createElement("luzmo-overlay") as LuzmoOverlay &
    HTMLElement;
  overlay.open = true;
  (overlay as unknown as { closeOnScroll: boolean }).closeOnScroll = false;
  overlay.triggerElement = cardElement;

  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    overlay.placement = getVerticalPlacement(cardElement);
  } else {
    overlay.placement = getOptimalPlacement(cardElement, 420);
  }
  return overlay;
};

const createPopover = (minWidth: string): LuzmoPopover & HTMLElement => {
  const popover = document.createElement("luzmo-popover") as LuzmoPopover &
    HTMLElement;
  popover.style.minWidth = `min(${minWidth}, calc(100vw - 2rem))`;
  popover.style.maxWidth = "calc(100vw - 2rem)";
  popover.style.maxHeight = "calc(100vh - 2rem)";
  popover.style.overflowY = "auto";
  popover.style.margin = "0 1rem";
  popover.style.padding = "1rem";
  popover.style.boxSizing = "border-box";
  return popover;
};

const extractDatasetIds = (slots: KeyMetricSlot[]): Set<string> => {
  const datasetIds = new Set<string>();
  for (const slot of slots) {
    for (const item of slot.content) {
      if (item.datasetId) {
        datasetIds.add(item.datasetId);
      }
    }
  }
  return datasetIds;
};

const insertOverlayBefore = (
  overlay: HTMLElement,
  cardElement: HTMLElement,
): void => {
  cardElement.parentElement?.insertBefore(overlay, cardElement);
};

interface ActiveState {
  actionsMenu: LuzmoItemGridItemActionsMenu & HTMLElement;
  actionsWrapper: HTMLElement;
  cardIndex: number;
  overlay: LuzmoOverlay & HTMLElement;
  popover: LuzmoPopover & HTMLElement;
}

export default class LuzmoKeyMetrics {
  private _activeState: ActiveState | null = null;
  private _actionsMenus: (LuzmoItemGridItemActionsMenu & HTMLElement)[] = [];
  private _actionsWrappers: HTMLElement[] = [];
  private _cards: HTMLDivElement[] = [];
  private _container!: HTMLDivElement;
  private _data: LuzmoKeyMetricsData;
  private _onDocumentClick: ((e: MouseEvent) => void) | null = null;
  private _readOnly: boolean;
  private _settings: LuzmoKeyMetricsConfig;
  private _theme: ItemThemeConfig | null = null;
  private _vizItems: LuzmoEmbedVizItem[] = [];
  private api: API;

  constructor({ api, config, data, readOnly }: ConstructorArgs) {
    this.api = api;
    this._readOnly = readOnly ?? false;
    this._settings = config ?? {};
    this._data = normalizeMetricsData(data);
    this.loadTheme();
  }

  static get toolbox() {
    return {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
        <rect width="8" height="7" x="2" y="3" stroke="currentColor" stroke-width="2" rx="2" />
        <rect width="8" height="7" x="14" y="14" stroke="currentColor" stroke-width="2" rx="2" />
        <rect width="8" height="7" x="14" y="3" stroke="currentColor" stroke-width="2" rx="2" />
        <rect width="8" height="7" x="2" y="14" stroke="currentColor" stroke-width="2" rx="2" />
      </svg>`,
      title: "Key Metrics",
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  private async loadTheme(): Promise<void> {
    try {
      this._theme = (await getTheme("default")) as ItemThemeConfig;
    } catch {
      this._theme = null;
    }
  }

  // -- Render ----------------------------------------------------------------

  render(): HTMLDivElement {
    this._container = document.createElement("div");
    this._container.classList.add("summary-cards");
    this._container.style.setProperty(
      "--key-metrics-columns",
      String(this._data.columns),
    );

    this._vizItems = [];
    this._actionsMenus = [];
    this._actionsWrappers = [];
    this._activeState = null;
    const version = this._settings.contentsVersion ?? CONTENTS_VERSION;

    for (let i = 0; i < this._data.content.length; i += 1) {
      const card = this.createMetricCard(i, version);
      this._container.append(card);
    }

    return this._container;
  }

  private createMetricCard(
    index: number,
    version: string,
  ): HTMLDivElement {
    const metric = this._data.content[index];
    const card = document.createElement("div");
    card.classList.add("number-card");

    if (!this._readOnly) {
      const actionsWrapper = document.createElement("div");
      actionsWrapper.classList.add("number-card__actions");

      const actionsMenu = document.createElement(
        "luzmo-item-grid-item-actions-menu",
      ) as LuzmoItemGridItemActionsMenu & HTMLElement;
      (actionsMenu as unknown as { actions: ActionGroup[] }).actions =
        structuredClone(METRIC_ACTIONS);
      (actionsMenu as unknown as { placement: string }).placement = "top-start";

      actionsMenu.addEventListener("luzmo-item-grid-item-action", ((
        event: CustomEvent,
      ) => {
        const { action, active } = event.detail;
        this.handleActionEvent(action as string, active as boolean, index, card, actionsMenu, actionsWrapper);
      }) as EventListener);

      this._actionsMenus[index] = actionsMenu;
      this._actionsWrappers[index] = actionsWrapper;
      actionsWrapper.append(actionsMenu);
      card.append(actionsWrapper);
    }

    const vizItem = document.createElement(
      "luzmo-embed-viz-item",
    ) as LuzmoEmbedVizItem;
    vizItem.setAttribute("type", metric.type || "evolution-number");
    vizItem.setAttribute("version", version);
    if (metric.slots) {
      vizItem.setAttribute("slots", JSON.stringify(metric.slots));
    }
    if (metric.options) {
      vizItem.setAttribute("options", JSON.stringify(metric.options));
    }
    if (metric.rawFilters && metric.rawFilters.length > 0) {
      vizItem.setAttribute("filters", JSON.stringify(metric.rawFilters));
    } else if (metric.filters) {
      vizItem.setAttribute("filters", JSON.stringify(metric.filters));
    }

    this._vizItems[index] = vizItem;
    this._cards[index] = card;
    card.append(vizItem);
    return card;
  }

  // -- Actions ---------------------------------------------------------------

  private dismissActiveState(resetToggles = true): void {
    if (!this._activeState) {
      return;
    }

    this.removeDocumentClickListener();
    this._activeState.overlay.remove();
    this._activeState.actionsWrapper.classList.remove("number-card__actions--active");
    this._cards[this._activeState.cardIndex]?.classList.remove("number-card--editing");
    this._container.classList.remove("summary-cards--editing");

    if (resetToggles) {
      const menu = this._activeState.actionsMenu as unknown as {
        clearActiveToggles?: () => void;
      };
      if (typeof menu.clearActiveToggles === "function") {
        menu.clearActiveToggles();
      }
    }

    this._activeState = null;
  }

  private handleActionEvent(
    action: string,
    active: boolean,
    index: number,
    cardElement: HTMLElement,
    actionsMenu: LuzmoItemGridItemActionsMenu & HTMLElement,
    actionsWrapper: HTMLElement,
  ): void {
    if (!active) {
      this.dismissActiveState(false);
      return;
    }

    const isSameCard = this._activeState?.cardIndex === index;

    if (isSameCard && this._activeState) {
      this.removeDocumentClickListener();
      this._activeState.overlay.remove();
      this._activeState = null;

      setTimeout(() => {
        actionsWrapper.classList.add("number-card__actions--active");
        this.openAction(action, index, cardElement, actionsMenu, actionsWrapper);
      }, 50);
      return;
    }

    if (this._activeState) {
      this.dismissActiveState();
    }

    actionsWrapper.classList.add("number-card__actions--active");
    this.openAction(action, index, cardElement, actionsMenu, actionsWrapper);
  }

  private updateOverlayPlacement(
    overlay: LuzmoOverlay & HTMLElement,
    action: string,
    cardElement: HTMLElement,
  ): void {
    if (action === "filters") {
      overlay.placement = getVerticalPlacement(cardElement);
    } else if (action === "item-options") {
      overlay.placement = getOptimalPlacement(cardElement, 320);
    } else {
      overlay.placement = getOptimalPlacement(cardElement, 420);
    }
  }

  private openAction(
    action: string,
    index: number,
    cardElement: HTMLElement,
    actionsMenu: LuzmoItemGridItemActionsMenu & HTMLElement,
    actionsWrapper: HTMLElement,
  ): void {
    const overlay = createOverlayForCard(cardElement);
    this.updateOverlayPlacement(overlay, action, cardElement);
    const popover = createPopover("400px");

    const content = this.createActionContent(action, index);
    if (content) {
      popover.append(content);
    }

    overlay.append(popover);
    insertOverlayBefore(overlay, cardElement);
    this.setActiveState(index, overlay, popover, actionsMenu, actionsWrapper);
  }

  private createActionContent(
    action: string,
    index: number,
  ): HTMLElement | null {
    switch (action) {
      case "edit-data": {
        return this.createEditDataPanel(index);
      }
      case "item-options": {
        return this.createEditOptionsPanel(index);
      }
      case "filters": {
        return this.createEditFiltersPanel(index);
      }
      default: {
        return null;
      }
    }
  }

  private setActiveState(
    cardIndex: number,
    overlay: LuzmoOverlay & HTMLElement,
    popover: LuzmoPopover & HTMLElement,
    actionsMenu: LuzmoItemGridItemActionsMenu & HTMLElement,
    actionsWrapper: HTMLElement,
  ): void {
    this._activeState = { actionsMenu, actionsWrapper, cardIndex, overlay, popover };
    this._cards[cardIndex]?.classList.add("number-card--editing");
    this._container.classList.add("summary-cards--editing");
    this.addDocumentClickListener();
  }

  private addDocumentClickListener(): void {
    this.removeDocumentClickListener();

    this._onDocumentClick = (e: MouseEvent) => {
      if (!this._activeState) {
        return;
      }

      const target = e.target as Node;
      const { overlay, actionsWrapper } = this._activeState;
      const card = this._cards[this._activeState.cardIndex];

      if (
        overlay.contains(target) ||
        actionsWrapper.contains(target) ||
        card?.contains(target)
      ) {
        return;
      }

      this.dismissActiveState();
    };

    document.addEventListener("click", this._onDocumentClick, true);
  }

  private removeDocumentClickListener(): void {
    if (this._onDocumentClick) {
      document.removeEventListener("click", this._onDocumentClick, true);
      this._onDocumentClick = null;
    }
  }

  private createEditDataPanel(index: number): HTMLElement {
    const metric = this._data.content[index];

    const dataPickerPanel = document.createElement(
      "luzmo-item-slot-picker-panel",
    ) as LuzmoItemSlotPickerPanel & HTMLElement;
    dataPickerPanel.size = "m";
    dataPickerPanel.itemType = metric.type;
    dataPickerPanel.slotsContents = metric.slots as unknown as typeof dataPickerPanel.slotsContents;
    dataPickerPanel.language = this._settings.language || "en";
    dataPickerPanel.slotMenuPlacement = "bottom-end";
    dataPickerPanel.grows = true;

    const datasetsDataFields = this.getDatasetsDataFields(metric);
    const panel = dataPickerPanel as unknown as Record<string, unknown>;
    if (datasetsDataFields.length > 0) {
      panel.datasetsDataFields = datasetsDataFields;
    } else {
      const datasetIds = [...extractDatasetIds(metric.slots)];
      if (datasetIds.length > 0) {
        panel.datasetIds = datasetIds;
        panel.authKey = this._settings.authKey;
        panel.authToken = this._settings.authToken;
      }
    }

    dataPickerPanel.addEventListener(
      "luzmo-slots-contents-changed",
      (event: Event) => {
        const customEvent = event as CustomEvent;
        const newSlots = customEvent.detail.slotsContents;
        metric.slots = newSlots;
        this._vizItems[index].slots = newSlots;
      },
    );

    return dataPickerPanel;
  }

  private createEditOptionsPanel(index: number): HTMLElement {
    const metric = this._data.content[index];

    const editItem = document.createElement(
      "luzmo-item-option-panel",
    ) as LuzmoItemOptionPanel & HTMLElement;
    editItem.size = "m";
    editItem.itemType = metric.type;
    editItem.options = structuredClone(metric.options) as Record<
      string,
      unknown
    >;
    editItem.slots = metric.slots as unknown as typeof editItem.slots;

    if (this._theme) {
      editItem.theme = this._theme;
    } else {
      LuzmoKeyMetrics.loadThemeForEditItem(editItem);
    }

    editItem.addEventListener("luzmo-options-changed", (event: Event) => {
      const customEvent = event as CustomEvent;
      const newOptions = structuredClone(customEvent.detail.options);
      metric.options = newOptions;
      this._vizItems[index].options = newOptions;
    });

    return editItem;
  }

  private static async loadThemeForEditItem(
    editItem: LuzmoItemOptionPanel & HTMLElement,
  ): Promise<void> {
    const theme = await getTheme("default");
    editItem.theme = theme as ItemThemeConfig;
  }

  private createEditFiltersPanel(index: number): HTMLElement {
    const metric = this._data.content[index];

    const editFilters = document.createElement(
      "luzmo-filters",
    ) as LuzmoFilters & HTMLElement;
    editFilters.size = "m";
    editFilters.language = this._settings.language || "en";
    editFilters.authKey = this._settings.authKey;
    editFilters.authToken = this._settings.authToken;
    editFilters.datasetIds = [...extractDatasetIds(metric.slots)];

    if (metric.rawFilters && metric.rawFilters.length > 0) {
      editFilters.filters =
        metric.rawFilters as unknown as typeof editFilters.filters;
    } else if (metric.filters && metric.filters.length > 0) {
      editFilters.filters = [
        {
          condition: "and" as const,
          filters: (metric.filters as { expression?: string; parameters?: unknown[] }[]).map(
            (f) => ({
              expression: f.expression,
              parameters: f.parameters,
            }),
          ),
        },
      ] as unknown as typeof editFilters.filters;
    }

    editFilters.addEventListener("luzmo-filters-changed", (event: Event) => {
      const customEvent = event as CustomEvent;
      const rawFilters = customEvent.detail.filters as FilterGroup[] | null;
      metric.rawFilters = rawFilters;

      if (rawFilters && rawFilters.length > 0) {
        this._vizItems[index].setAttribute(
          "filters",
          JSON.stringify(rawFilters),
        );
      } else {
        this._vizItems[index].removeAttribute("filters");
      }
    });

    return editFilters;
  }

  // -- Grid layout settings --------------------------------------------------

  renderSettings() {
    return [
      {
        children: { items: this.createGridLayoutMenuItems() },
        icon: toSvgString(luzmoColumns, 12),
        label: this.api.i18n.t("Grid layout"),
      },
    ];
  }

  private createGridLayoutMenuItems() {
    return GRID_LAYOUTS.map((layout) => ({
      closeOnActivate: true,
      isActive:
        this._data.columns === layout.columns &&
        this._data.rows === layout.rows,
      name: layout.label,
      onActivate: () =>
        this.setGridLayout(layout.columns, layout.rows),
      title: layout.label,
    }));
  }

  private setGridLayout(columns: number, rows: number): void {
    this._data.columns = columns;
    this._data.rows = rows;

    const totalNeeded = columns * rows;

    while (this._data.content.length < totalNeeded) {
      this._data.content.push(cloneDefaultMetric());
    }
    if (this._data.content.length > totalNeeded) {
      this._data.content = this._data.content.slice(0, totalNeeded);
    }

    this.reRender();
  }

  private reRender(): void {
    if (!this._container) {
      return;
    }

    this.dismissActiveState();
    this._container.innerHTML = "";
    this._container.style.setProperty(
      "--key-metrics-columns",
      String(this._data.columns),
    );

    this._vizItems = [];
    this._actionsMenus = [];
    this._actionsWrappers = [];
    const version = this._settings.contentsVersion ?? CONTENTS_VERSION;

    for (let i = 0; i < this._data.content.length; i += 1) {
      const card = this.createMetricCard(i, version);
      this._container.append(card);
    }
  }

  // -- Helpers ---------------------------------------------------------------

  private getDatasetsDataFields(metric: KeyMetricItem): DatasetDataFields[] {
    if (
      this._settings.datasetsDataFields &&
      this._settings.datasetsDataFields.length > 0
    ) {
      return this._settings.datasetsDataFields;
    }

    const usedDatasetIds = [...extractDatasetIds(metric.slots)];
    if (usedDatasetIds.length > 0) {
      const filtered = DATASETS_DATA_FIELDS.filter((d) =>
        usedDatasetIds.includes(d.id),
      );
      if (filtered.length > 0) {
        return filtered;
      }
    }

    return DATASETS_DATA_FIELDS;
  }

  // -- Save ------------------------------------------------------------------

  save(): LuzmoKeyMetricsData {
    return {
      columns: this._data.columns,
      content: this._data.content,
      rows: this._data.rows,
    };
  }
}
