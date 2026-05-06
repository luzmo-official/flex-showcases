declare module '@luzmo/analytics-components-kit/item-slots-configs' {
  import type { SlotConfig } from '@luzmo/dashboard-contents-types';

  export const areaChartSlotsConfig: SlotConfig[];
  export const barChartSlotsConfig: SlotConfig[];
  export const boxPlotSlotsConfig: SlotConfig[];
  export const bubbleChartSlotsConfig: SlotConfig[];
  export const bulletChartSlotsConfig: SlotConfig[];
  export const choroplethMapSlotsConfig: SlotConfig[];
  export const circlePackChartSlotsConfig: SlotConfig[];
  export const circularGaugeSlotsConfig: SlotConfig[];
  export const columnChartSlotsConfig: SlotConfig[];
  export const combinationChartSlotsConfig: SlotConfig[];
  export const conditionalNumberSlotsConfig: SlotConfig[];
  export const dateComparisonFilterSlotsConfig: SlotConfig[];
  export const dateFilterSlotsConfig: SlotConfig[];
  export const donutChartSlotsConfig: SlotConfig[];
  export const dropdownFilterSlotsConfig: SlotConfig[];
  export const evolutionNumberSlotsConfig: SlotConfig[];
  export const funnelChartSlotsConfig: SlotConfig[];
  export const heatMapSlotsConfig: SlotConfig[];
  export const heatTableSlotsConfig: SlotConfig[];
  export const hexbinMapSlotsConfig: SlotConfig[];
  export const imageSlotsConfig: SlotConfig[];
  export const lineChartSlotsConfig: SlotConfig[];
  export const markerMapSlotsConfig: SlotConfig[];
  export const ohlcChartSlotsConfig: SlotConfig[];
  export const parallelCoordinatesPlotSlotsConfig: SlotConfig[];
  export const pivotTableSlotsConfig: SlotConfig[];
  export const pyramidChartSlotsConfig: SlotConfig[];
  export const radarChartSlotsConfig: SlotConfig[];
  export const regularTableSlotsConfig: SlotConfig[];
  export const routeMapSlotsConfig: SlotConfig[];
  export const sankeyDiagramSlotsConfig: SlotConfig[];
  export const scatterPlotSlotsConfig: SlotConfig[];
  export const searchFilterSlotsConfig: SlotConfig[];
  export const slicerFilterSlotsConfig: SlotConfig[];
  export const sliderFilterSlotsConfig: SlotConfig[];
  export const speedometerChartSlotsConfig: SlotConfig[];
  export const spikeMapSlotsConfig: SlotConfig[];
  export const stripPlotSlotsConfig: SlotConfig[];
  export const sunburstChartSlotsConfig: SlotConfig[];
  export const symbolMapSlotsConfig: SlotConfig[];
  export const textSlotsConfig: SlotConfig[];
  export const treemapChartSlotsConfig: SlotConfig[];
  export const vennDiagramSlotsConfig: SlotConfig[];
  export const videoSlotsConfig: SlotConfig[];
  export const wordcloudChartSlotsConfig: SlotConfig[];
}

declare module '@luzmo/analytics-components-kit/utils' {
  import type { SlotConfig, Slot, VizItemType } from '@luzmo/dashboard-contents-types';

  // FilterCondition from edit-filters
  export interface EditFiltersFilterCondition {
    expression?: string;
    parameters?: any[];
  }

  // FilterGroup from edit-filters (uppercase conditions)
  export interface EditFiltersFilterGroup {
    condition: 'AND' | 'OR';
    filters: (EditFiltersFilterCondition | EditFiltersFilterGroup)[];
  }

  // VizItemFilterGroup for luzmo-viz-item (lowercase conditions)
  export interface VizItemFilterGroup {
    condition: 'and' | 'or';
    filters: EditFiltersFilterCondition[];
    subGroups: VizItemFilterGroup[];
  }

  export function transformFilters(filters: EditFiltersFilterGroup | null | undefined): VizItemFilterGroup[];

  export function switchItem(options: { oldItemType: VizItemType; newItemType: VizItemType; slots: Slot[] }): { slots: Slot[] };

  export function loadDraggableFieldsForDatasets(options: {
    datasetIds: string[];
    apiUrl: string;
    authKey: string;
    authToken: string;
  }): Promise<any>;
}
