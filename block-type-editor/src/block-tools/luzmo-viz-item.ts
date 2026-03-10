import "./luzmo-viz-item.scss";
import "@luzmo/analytics-components-kit/edit-filters";
import "@luzmo/analytics-components-kit/item-data-picker-panel";
import "@luzmo/lucero/overlay";
import type { API } from "@editorjs/editorjs";
import type {
  LuzmoEditFilters,
  LuzmoEditItem,
} from "@luzmo/analytics-components-kit";
import type { LuzmoItemDataPickerPanel } from "@luzmo/analytics-components-kit/item-data-picker-panel";
import { getTheme, switchItem } from "@luzmo/analytics-components-kit/utils";
import type {
  FilterGroup as EmbedFilterGroup,
  ItemFilter,
  ItemThemeConfig,
  LuzmoEmbedVizItem,
  VizItemOptions,
  VizItemSlot,
  VizItemType,
} from "@luzmo/embed";
import {
  luzmoAreaChartSimple,
  luzmoBarChartSimple,
  luzmoBubbleChartSimple,
  luzmoColumnChartSimple,
  luzmoDonutChartSimple,
  luzmoEvolutionNumberSimple,
  luzmoFunnelChartSimple,
  luzmoLineChartSimple,
  luzmoCog,
  luzmoPieChartSimple,
  luzmoPivotTableSimple,
  luzmoRegularTableSimple,
  luzmoArrowsHorizontal,
  luzmoFilterOutline,
  luzmoTable,
  luzmoTreemapChartSimple,
} from "@luzmo/icons";
import type { LuzmoOverlay, LuzmoPopover } from "@luzmo/lucero";

import { DATASETS_DATA_FIELDS } from "../data";
import { type FilterGroup, getActiveFilters } from "../utils/filters";
import { toSvgString } from "../utils/icons";

export interface VizItemData {
  filters: ItemFilter[];
  options: VizItemOptions;
  rawFilters?: FilterGroup | null;
  slots: VizItemSlot[];
  type: string;
}

export interface DatasetDataFields {
  columns: unknown[];
  description?: Record<string, string>;
  formulas: unknown[];
  id: string;
  name: Record<string, string>;
}

export interface VizItemConfig {
  appServer: string;
  authKey: string;
  authToken: string;
  contentsVersion: string;
  datasetsDataFields?: DatasetDataFields[];
  language: string;
}

interface ConstructorArgs {
  api: API;
  config?: VizItemConfig;
  data: Partial<VizItemData>;
  readOnly?: boolean;
}

interface ItemTypeConfig {
  icon: readonly [number, number, string | string[], ...unknown[]];
  label: string;
  mode?: string;
  type: string;
}

const ITEM_TYPES: ItemTypeConfig[] = [
  { icon: luzmoBarChartSimple.icon, label: "Bar chart", type: "bar-chart" },
  {
    icon: luzmoColumnChartSimple.icon,
    label: "Column chart",
    type: "column-chart",
  },
  { icon: luzmoLineChartSimple.icon, label: "Line chart", type: "line-chart" },
  { icon: luzmoPieChartSimple.icon, label: "Pie chart", mode: "pie", type: "donut-chart" },
  {
    icon: luzmoDonutChartSimple.icon,
    label: "Donut chart",
    mode: "donut",
    type: "donut-chart",
  },
  {
    icon: luzmoTreemapChartSimple.icon,
    label: "Treemap chart",
    type: "treemap-chart",
  },
  {
    icon: luzmoFunnelChartSimple.icon,
    label: "Funnel chart",
    type: "funnel-chart",
  },
  { icon: luzmoAreaChartSimple.icon, label: "Area chart", type: "area-chart" },
  {
    icon: luzmoEvolutionNumberSimple.icon,
    label: "Evolution number",
    type: "evolution-number",
  },
  {
    icon: luzmoBubbleChartSimple.icon,
    label: "Bubble chart",
    type: "bubble-chart",
  },
  {
    icon: luzmoRegularTableSimple.icon,
    label: "Regular table",
    type: "regular-table",
  },
  {
    icon: luzmoPivotTableSimple.icon,
    label: "Pivot table",
    type: "pivot-table",
  },
];

const normalizeVizItemData = (data: Partial<VizItemData>): VizItemData => ({
  filters: data.filters ?? [],
  options: data.options ?? {},
  rawFilters: data.rawFilters ?? null,
  slots: data.slots ?? [],
  type: data.type ?? "column-chart",
});

const MOBILE_BREAKPOINT = 600;

const getOptimalPlacement = (
  triggerElement: HTMLElement,
  popoverWidth = 400
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
  triggerElement: HTMLElement
): "bottom" | "top" => {
  const rect = triggerElement.getBoundingClientRect();
  const spaceBottom = window.innerHeight - rect.bottom;
  const spaceTop = rect.top;

  // Prefer bottom, use top only if more space available there
  return spaceBottom >= spaceTop ? "bottom" : "top";
};

const extractDatasetIds = (slots: unknown): Set<string> => {
  const datasetIds = new Set<string>();

  if (Array.isArray(slots)) {
    for (const slot of slots as { content?: { datasetId?: string }[] }[]) {
      if (slot?.content && Array.isArray(slot.content)) {
        for (const item of slot.content) {
          if (item?.datasetId && typeof item.datasetId === "string") {
            datasetIds.add(item.datasetId);
          }
        }
      }
    }
  } else if (slots && typeof slots === "object") {
    for (const slot of Object.values(slots as Record<string, unknown>)) {
      if (Array.isArray(slot)) {
        for (const item of slot as { datasetId?: string }[]) {
          if (item?.datasetId && typeof item.datasetId === "string") {
            datasetIds.add(item.datasetId);
          }
        }
      }
    }
  }

  return datasetIds;
};

const createOverlay = (blockElement: {
  holder: unknown;
}): LuzmoOverlay & HTMLElement => {
  const overlay = document.createElement("luzmo-overlay") as LuzmoOverlay &
    HTMLElement;
  overlay.open = true;
  (overlay as unknown as { closeOnScroll: boolean }).closeOnScroll = false;
  overlay.triggerElement = blockElement.holder as HTMLElement;

  const holder = blockElement.holder as HTMLElement;
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    overlay.placement = getVerticalPlacement(holder);
  } else {
    overlay.placement = getOptimalPlacement(holder, 420);
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

const insertOverlay = (
  overlay: HTMLElement,
  blockElement: { holder: unknown }
): void => {
  (blockElement.holder as HTMLElement).parentElement?.insertBefore(
    overlay,
    blockElement.holder as HTMLElement
  );
};

const loadThemeAsync = async (
  editItem: LuzmoEditItem & HTMLElement
): Promise<void> => {
  const theme = await getTheme("default");
  editItem.theme = theme as ItemThemeConfig;
};

export default class LuzmoVizItem {
  wrapper: HTMLDivElement;
  private _data: VizItemData;
  private _rawFilters: FilterGroup | null = null;
  private _settings: VizItemConfig;
  private _theme: ItemThemeConfig | null = null;
  private _vizItemElement!: LuzmoEmbedVizItem;
  private api: API;

  constructor({ api, config, data }: ConstructorArgs) {
    this.api = api;
    this._settings = config || ({} as VizItemConfig);
    this._data = normalizeVizItemData(data);

    if (this._data.rawFilters) {
      this._rawFilters = this._data.rawFilters;
    }

    this.loadTheme();
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("viz-item-container");
  }

  private async loadTheme(): Promise<void> {
    try {
      this._theme = (await getTheme("default")) as ItemThemeConfig;
      this._theme.font = this._theme.font ?? {};
      this._theme.font.fontSize = this._theme.font.fontSize ?? 18;
    } catch {
      this._theme = { font: { fontSize: 18 } } as ItemThemeConfig;
    }
  }

  static get toolbox() {
    return {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m16 4 3 1v3M5 12l4-4 3 3 7-6M9 14v5M13 16v3M17 12v7M5 17v2" />
      </svg>`,
      title: "Chart",
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  private configureOptions(): void {
    this._data.options = this._data.options ?? ({} as VizItemOptions);
    const options = this._data.options as unknown as Record<string, unknown>;
    options.display = options.display ?? {};
    (options.display as Record<string, unknown>).title = false;

    if (options.theme === undefined && this._theme) {
      options.theme = this._theme;
    }
    this._vizItemElement.options = this._data.options;
  }

  private configureFilters(): void {
    if (this._rawFilters) {
      const transformedFilters = getActiveFilters(this._rawFilters);
      this._vizItemElement.filters =
        transformedFilters as unknown as EmbedFilterGroup[];
    } else if (this._data?.filters) {
      this._vizItemElement.filters = this._data
        .filters as unknown as EmbedFilterGroup[];
    }
  }

  private configureVizItemElement(): void {
    this._data.type = this._data.type || "column-chart";
    this._vizItemElement.type = this._data.type as VizItemType;

    if (this._data?.slots) {
      this._vizItemElement.slots = this._data.slots;
    }

    this.configureOptions();
    this.configureFilters();
  }

  render(): HTMLDivElement {
    const vizItemWrapper = document.createElement("div");
    vizItemWrapper.classList.add("viz-item-wrapper");

    this._vizItemElement = document.createElement(
      "luzmo-embed-viz-item"
    ) as LuzmoEmbedVizItem;
    this.configureVizItemElement();

    vizItemWrapper.append(this._vizItemElement);
    this.wrapper.append(vizItemWrapper);
    return this.wrapper;
  }

  private createSwitchTypeMenuItems() {
    return ITEM_TYPES.map((typeConfig) => {
      const iconPath = Array.isArray(typeConfig.icon[2])
        ? typeConfig.icon[2][0]
        : typeConfig.icon[2];
      return {
        closeOnActivate: true,
        icon: `<div class="editor-tunes-luzmo-icon-wrapper">
          <svg width="12" height="12" viewBox="0 0 ${typeConfig.icon[0]} ${typeConfig.icon[1]}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="${iconPath}" fill="currentColor" stroke-width="0"/>
          </svg>
        </div>`,
        isActive: this._data.type === typeConfig.type
          && (!typeConfig.mode || (this._data.options as Record<string, unknown>)?.mode === typeConfig.mode),
        name: this.api.i18n.t(typeConfig.label),
        onActivate: () => this.setItemType(typeConfig.type as VizItemType, typeConfig.mode),
        title: this.api.i18n.t(typeConfig.label),
      };
    });
  }

  private setupEditItem(editItem: LuzmoEditItem & HTMLElement): void {
    editItem.size = "m";
    editItem.itemType = this._data.type;
    editItem.options = structuredClone(this._data.options) as Record<
      string,
      unknown
    >;
    editItem.slots = this._data.slots;

    if (this._theme) {
      editItem.theme = this._theme;
    } else {
      loadThemeAsync(editItem);
    }

    editItem.addEventListener("luzmo-options-changed", (event: Event) => {
      const customEvent = event as CustomEvent;
      const newOptions = structuredClone(customEvent.detail.options);
      this._data.options = newOptions;
      this._vizItemElement.options = newOptions;
    });
  }

  private dispatchEditOptionEvent(): void {
    const customEvent = new CustomEvent("edit-option", {
      detail: {
        itemType: this._data.type,
        options: this._data.options,
        slots: this._data.slots,
      },
    });
    document.querySelector("#editor")?.dispatchEvent(customEvent);
  }

  private handleEditOptions(): void {
    const blockIndex = this.api.blocks.getCurrentBlockIndex();
    const blockElement = this.api.blocks.getBlockByIndex(blockIndex);

    if (!blockElement?.holder) {
      return;
    }

    const overlay = createOverlay(blockElement);
    overlay.placement = getOptimalPlacement(
      blockElement.holder as HTMLElement,
      320
    );
    const popover = createPopover("300px");

    const editItem = document.createElement(
      "luzmo-edit-item"
    ) as LuzmoEditItem & HTMLElement;
    this.setupEditItem(editItem);

    popover.append(editItem);
    overlay.append(popover);
    insertOverlay(overlay, blockElement);

    this.dispatchEditOptionEvent();
  }

  private setDatasetIdsForPanel(panel: Record<string, unknown>): void {
    const datasetIds = this.getDatasetIdsFromSlots();
    if (datasetIds.length > 0) {
      panel.datasetIds = datasetIds;
      panel.authKey = this._settings?.authKey;
      panel.authToken = this._settings?.authToken;
    }
  }

  private setupDataPickerPanel(
    dataPickerPanel: LuzmoItemDataPickerPanel & HTMLElement
  ): void {
    dataPickerPanel.size = "m";
    dataPickerPanel.itemType = this._data.type;
    dataPickerPanel.slotsContents = this._data.slots || [];
    dataPickerPanel.language = this._settings?.language || "en";
    dataPickerPanel.slotMenuPlacement = "bottom-end";
    dataPickerPanel.grows = true;

    const datasetsDataFields = this.getDatasetsDataFieldsFromSlots();
    const panel = dataPickerPanel as unknown as Record<string, unknown>;

    if (datasetsDataFields.length > 0) {
      panel.datasetsDataFields = datasetsDataFields;
    } else {
      this.setDatasetIdsForPanel(panel);
    }

    dataPickerPanel.addEventListener(
      "luzmo-slots-contents-changed",
      (event: Event) => {
        const customEvent = event as CustomEvent;
        const newSlots = customEvent.detail.slotsContents;
        this._data.slots = newSlots;
        this._vizItemElement.slots = newSlots;
      }
    );
  }

  private handleEditData(): void {
    const blockIndex = this.api.blocks.getCurrentBlockIndex();
    const blockElement = this.api.blocks.getBlockByIndex(blockIndex);

    if (!blockElement?.holder) {
      return;
    }

    const overlay = createOverlay(blockElement);
    const popover = createPopover("400px");

    const dataPickerPanel = document.createElement(
      "luzmo-item-data-picker-panel"
    ) as LuzmoItemDataPickerPanel & HTMLElement;
    this.setupDataPickerPanel(dataPickerPanel);

    popover.append(dataPickerPanel);
    overlay.append(popover);
    insertOverlay(overlay, blockElement);
  }

  private setupEditFilters(editFilters: LuzmoEditFilters & HTMLElement): void {
    editFilters.size = "m";
    editFilters.language = this._settings?.language || "en";
    editFilters.authKey = this._settings?.authKey;
    editFilters.authToken = this._settings?.authToken;
    editFilters.datasetIds = this.getDatasetIdsFromSlots();

    if (this._rawFilters) {
      editFilters.filters = [
        this._rawFilters,
      ] as unknown as typeof editFilters.filters;
    } else if (this._data?.filters && this._data.filters.length > 0) {
      editFilters.filters = [
        {
          condition: "and" as const,
          filters: this._data.filters.map((f) => ({
            expression: f.expression,
            parameters: f.parameters,
          })),
        },
      ] as unknown as typeof editFilters.filters;
    }

    editFilters.addEventListener("luzmo-filters-changed", (event: Event) => {
      const customEvent = event as CustomEvent;
      const filterGroup = customEvent.detail.filters as FilterGroup | null;
      this._rawFilters = filterGroup;
      const transformedFilters = getActiveFilters(this._rawFilters);
      (this._vizItemElement as unknown as { filters: unknown }).filters =
        transformedFilters;
    });
  }

  private handleSetFilters(): void {
    const blockIndex = this.api.blocks.getCurrentBlockIndex();
    const blockElement = this.api.blocks.getBlockByIndex(blockIndex);

    if (!blockElement?.holder) {
      return;
    }

    const overlay = createOverlay(blockElement);
    // Filters should only appear above or below, never on sides
    overlay.placement = getVerticalPlacement(
      blockElement.holder as HTMLElement
    );
    const popover = createPopover("400px");

    const editFilters = document.createElement(
      "luzmo-edit-filters"
    ) as LuzmoEditFilters & HTMLElement;
    this.setupEditFilters(editFilters);

    popover.append(editFilters);
    overlay.append(popover);
    insertOverlay(overlay, blockElement);
  }

  renderSettings() {
    return [
      {
        children: { items: this.createSwitchTypeMenuItems() },
        icon: toSvgString(luzmoArrowsHorizontal, 12),
        label: this.api.i18n.t("Switch type"),
      },
      {
        closeOnActivate: true,
        icon: toSvgString(luzmoCog, 12),
        label: this.api.i18n.t("Edit options"),
        onActivate: () => this.handleEditOptions(),
      },
      {
        closeOnActivate: true,
        icon: toSvgString(luzmoTable, 12),
        label: this.api.i18n.t("Edit data"),
        onActivate: () => this.handleEditData(),
      },
      {
        closeOnActivate: true,
        icon: toSvgString(luzmoFilterOutline, 12),
        label: this.api.i18n.t("Set filters"),
        onActivate: () => this.handleSetFilters(),
      },
    ];
  }

  getDatasetIdsFromSlots(): string[] {
    if (!this._data?.slots) {
      return [];
    }
    return [...extractDatasetIds(this._data.slots)];
  }

  getDatasetsDataFieldsFromSlots(): DatasetDataFields[] {
    if (
      this._settings?.datasetsDataFields &&
      this._settings.datasetsDataFields.length > 0
    ) {
      return this._settings.datasetsDataFields;
    }

    const usedDatasetIds = this.getDatasetIdsFromSlots();
    if (usedDatasetIds.length > 0) {
      const filteredDatasets = DATASETS_DATA_FIELDS.filter((d) =>
        usedDatasetIds.includes(d.id)
      );
      if (filteredDatasets.length > 0) {
        return filteredDatasets;
      }
    }

    return DATASETS_DATA_FIELDS;
  }

  async setItemType(type: VizItemType, mode?: string): Promise<void> {
    const isSameType = this._data.type === type;

    if (!isSameType) {
      const newItem = await switchItem({
        newItemType: type,
        oldItemType: this._data.type,
        options: this._data.options as unknown as Record<string, unknown>,
        slots: this._data.slots,
      });
      this._data.type = newItem.type;
      this._data.slots = newItem.slots;
      this._data.options = newItem.options as VizItemOptions;
    }

    if (mode) {
      (this._data.options as Record<string, unknown>).mode = mode;
    }

    this._vizItemElement.type = this._data.type as VizItemType;
    this._vizItemElement.slots = this._data.slots;
    this._vizItemElement.options = { ...this._data.options };
  }

  save() {
    return {
      filters: this._data?.filters || [],
      options: this._data?.options || {},
      rawFilters: this._rawFilters,
      slots: this._data?.slots || [],
      type: this._data?.type || "column-chart",
    };
  }
}
