import { VizItemOptions, VizItemSlot, VizItemType } from '@luzmo/dashboard-contents-types';
import {
  NEWSPAPER_LIGHT_THEME,
  NEWSPAPER_LIGHT_LOADER_OPTIONS,
  NEWSPAPER_DARK_THEME,
  NEWSPAPER_DARK_LOADER_OPTIONS,
} from './luzmo-theme.config';

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type LuzmoFlexChart = {
  type: VizItemType;
  slots: VizItemSlot[];
  options: DeepPartial<VizItemOptions>;
};

export const COFFEE_CONSUMPTION_CHOROPLETH: LuzmoFlexChart = {
  type: 'choropleth-map',
  slots: [
    {
      name: 'geo',
      content: [
        {
          type: 'spatial',
          datasetId: 'e7b7d840-923a-40f4-a734-40bfbeab7f1d',
          set: 'e7b7d840-923a-40f4-a734-40bfbeab7f1d',
          columnId: '969b0bb5-a8ff-4968-ab3d-be3dcecf1851',
          column: '969b0bb5-a8ff-4968-ab3d-be3dcecf1851',
          label: { en: 'Country' },
          subtype: 'topography',
          lowestLevel: 0,
          format: '',
          id: '8fb2ff75-f2bd-4c92-82d0-17c1b667bf3e',
        },
      ],
    },
    {
      name: 'measure',
      content: [
        {
          type: 'numeric',
          datasetId: 'c71b6e44-699a-4677-bd92-ca333f3fb0e2',
          set: 'c71b6e44-699a-4677-bd92-ca333f3fb0e2',
          columnId: 'a8d93393-50e1-47bb-be8e-d097f5f089e9',
          column: 'a8d93393-50e1-47bb-be8e-d097f5f089e9',
          label: { en: 'Consumption per year (kg)' },
          lowestLevel: 0,
          format: '.1af',
          id: '5b0e2a61-a724-404b-b00d-5079968fb67f',
        },
      ],
    },
    {
      name: 'category',
      content: [],
    },
  ],
  options: {
    theme: { ...NEWSPAPER_LIGHT_THEME },
    loader: { ...NEWSPAPER_LIGHT_LOADER_OPTIONS },
    tileProvider: {
      name: 'OpenStreetMap',
      vectorId: 'osm-bright',
    },
    vectorTileProvider: {
      name: 'Fiord',
      id: 'fiord-color',
      rasterName: 'OpenStreetMap',
    },
    enabled: {
      zoom: true,
      pan: true,
      pitchBearing: false,
      repositionOnRefresh: true,
    },
    zoomRange: [0, 25],
    pin: {
      zoom: 2.5,
      center: [
        54.757300773245674,
        10.565075322796247
      ],
      "auto": false,
      "pitch": 0,
      "bearing": 0
    },
    disableWebgl: false,
    limit: { number: 1000 },
    manualValues: {
      ranges: [
        { val: 1, color: 'rgb(224, 243, 245)' },
        { val: 2.571428571428571, color: 'rgb(178, 226, 229)' },
        { val: 4.142857142857142, color: 'rgb(127, 203, 209)' },
        { val: 5.7142857142857135, color: 'rgb(75, 178, 186)' },
        { val: 7.285714285714286, color: 'rgb(35, 150, 160)' },
        { val: 8.857142857142858, color: 'rgb(13, 118, 128)' },
        { val: 10.428571428571427, color: 'rgb(4, 84, 92)' },
      ],
    },
    classification: 'continuous',
    numberClasses: 7,
    opacity: 1,
    strokeColor: 'rgba(0,0,0,.3)',
    colorsClass: 'manual',
    tooltip: { allValues: true, percentages: true },
    highlights: { active: true, color: 'rgb(255,255,255)' },
    display: { title: false, legend: false },
    legend: { position: 'bottomLeft' },
    interactivity: {
      availableExportTypes: [],
      customTooltip: null,
      exportTypes: [],
      select: false,
    },
    filter: {},
    title: { en: 'Choropleth map' },
  },
};

export const CONSUMPTION_LINE_CHART: LuzmoFlexChart = {
  type: 'line-chart',
  slots: [
    {
      name: 'measure',
      content: [
        {
          type: 'numeric',
          datasetId: 'bebbbd33-c4d6-4b38-9a9c-6a54f0ab3cf2',
          set: 'bebbbd33-c4d6-4b38-9a9c-6a54f0ab3cf2',
          columnId: '2fde5091-fc8c-4e7b-90de-91a2f92d4c5a',
          column: '2fde5091-fc8c-4e7b-90de-91a2f92d4c5a',
          label: { en: 'Coffee consumption' },
          lowestLevel: 0,
          format: '.1af',
          id: '271ac750-c18b-402e-9b93-b2f6502625ba',
        },
      ],
    },
    {
      name: 'x-axis',
      content: [
        {
          type: 'datetime',
          datasetId: 'bebbbd33-c4d6-4b38-9a9c-6a54f0ab3cf2',
          set: 'bebbbd33-c4d6-4b38-9a9c-6a54f0ab3cf2',
          columnId: '95af3409-96e2-4f76-9d0a-97a881611597',
          column: '95af3409-96e2-4f76-9d0a-97a881611597',
          label: { en: 'Year' },
          lowestLevel: 9,
          format: '%amd~%Y',
          level: 1,
          id: '16031785-de8e-42d4-9e09-c403aeb5d126',
        },
      ],
    },
    {
      name: 'legend',
      content: [],
    },
  ],
  options: {
    theme: { ...NEWSPAPER_LIGHT_THEME },
    loader: { ...NEWSPAPER_LIGHT_LOADER_OPTIONS },
    interpolation: 'linear',
    grid: {
      x: { enabled: false },
      y: { enabled: false },
      y2: { enabled: false },
    },
    axislabels: {
      x: { enabled: false, position: 'center' },
      y: { enabled: false, position: 'middle' },
      y2: { enabled: false, position: 'middle' },
    },
    axis: {
      x: { ticksMode: 'ticks', color: 'rgb(51, 48, 46)' },
      y: { scale: 'linear', ticksMode: 'ticks', type: 'default', color: 'rgb(51, 48, 46)' },
      y2: {
        active: false,
        measureIndexes: [1],
        scale: 'linear',
        ticksMode: 'ticks',
        type: 'default',
      },
    },
    lines: { strokeWidth: 1, gradient: true },
    markers: { enabled: false, size: 2 },
    interactivity: {
      availableExportTypes: [],
      brush: false,
      customTooltip: null,
      exportTypes: []
    },
    display: { title: false, legend: true },
    legend: { position: 'topRight' },
    filter: {},
    nullBreak: false,
    missingValue: { type: 'no' },
    limit: { number: 10000 },
    title: { en: 'Line chart' },
  },
};

export const LATTE_PRICE_BAR_CHART: LuzmoFlexChart = {
  type: 'bar-chart',
  slots: [
    {
      name: 'y-axis',
      content: [
        {
          type: 'hierarchy',
          datasetId: 'fd58ce20-da95-43c5-88e2-9761ea3fd055',
          set: 'fd58ce20-da95-43c5-88e2-9761ea3fd055',
          columnId: 'e7752232-9576-434e-911f-893f76419e6b',
          column: 'e7752232-9576-434e-911f-893f76419e6b',
          label: { en: 'City' },
          lowestLevel: 0,
          format: '',
          level: null,
          id: 'd129083c-cb1e-4644-aca2-c2f06e1791f2',
        },
      ],
    },
    {
      name: 'measure',
      content: [
        {
          type: 'numeric',
          datasetId: 'fd58ce20-da95-43c5-88e2-9761ea3fd055',
          set: 'fd58ce20-da95-43c5-88e2-9761ea3fd055',
          columnId: 'dc4473a1-d44b-4fd2-8364-a30fdafa3832',
          column: 'dc4473a1-d44b-4fd2-8364-a30fdafa3832',
          label: { en: 'Latte price' },
          lowestLevel: 0,
          format: '.2af',
          id: '11995d4f-0a4e-47cc-99d2-3ca8da07cef7',
          subtype: 'currency',
          currency: '$',
        },
      ],
    },
    {
      name: 'legend',
      content: [],
    },
  ],
  options: {
    theme: { ...NEWSPAPER_LIGHT_THEME },
    loader: { ...NEWSPAPER_LIGHT_LOADER_OPTIONS },
    mode: 'grouped',
    categories: { colored: false },
    grid: {
      x: { enabled: false },
      y: { enabled: false },
    },
    axislabels: {
      x: { enabled: false, position: 'center' },
      y: { enabled: false, position: 'middle' },
    },
    axis: {
      x: { ticksMode: 'ticks', scale: 'linear', color: 'rgb(51, 48, 46)' },
      y: { ticksMode: 'ticks', color: 'rgb(51, 48, 46)' },
    },
    bars: { label: 'none' },
    filter: {},
    display: { title: false, legend: true, modeOption: false },
    legend: { position: 'topRight' },
    interactivity: {
      availableExportTypes: [],
      customTooltip: null,
      select: false,
      exportTypes: [],
    },
    ranking: { active: false, direction: 'top', number: 10 },
    limit: { number: 500 },
    sort: { by: 'measure', direction: 'desc' },
    title: { en: 'Bar chart' },
  },
};

export const SPEND_VS_PRODUCTIVITY_SCATTER: LuzmoFlexChart = {
  type: 'scatter-plot',
  slots: [
    {
      name: 'y-axis',
      content: [
        {
          type: 'numeric',
          datasetId: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          set: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          columnId: 'cfde2294-6046-4ba4-89ce-5feb41bdc38b',
          column: 'cfde2294-6046-4ba4-89ce-5feb41bdc38b',
          label: { en: 'Productivity index' },
          lowestLevel: 0,
          format: '.0af',
          id: 'a7bd191f-3e08-4193-968b-13683a96f162',
        },
      ],
    },
    {
      name: 'name',
      content: [
        {
          type: 'hierarchy',
          datasetId: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          set: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          columnId: '9fd3495f-e9a3-4763-8a0b-41b0a592da0f',
          column: '9fd3495f-e9a3-4763-8a0b-41b0a592da0f',
          label: { en: 'Country' },
          lowestLevel: 0,
          format: '',
          level: null,
          id: '232e2e34-2dd9-4029-a8c9-d8ae510489d7',
        },
      ],
    },
    {
      name: 'size',
      content: [
        {
          type: 'numeric',
          datasetId: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          set: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          columnId: '8eb53599-8f30-469d-af69-2b7d33eb56cc',
          column: '8eb53599-8f30-469d-af69-2b7d33eb56cc',
          label: { en: 'Coffee consumption per year (kg)' },
          lowestLevel: 0,
          format: '.1af',
          id: '1f01365a-ce1d-4c86-8ca3-e8445ff0267f',
        },
      ],
    },
    {
      name: 'x-axis',
      content: [
        {
          type: 'numeric',
          datasetId: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          set: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          columnId: 'd898742a-4d94-4c8d-995e-c2552d65a92a',
          column: 'd898742a-4d94-4c8d-995e-c2552d65a92a',
          label: { en: 'Coffee spend per year' },
          lowestLevel: 0,
          format: '.0af',
          id: '8f24a892-d8d3-4b69-8fa3-82cfc5e2d7e5',
          subtype: 'currency',
          currency: '$',
        },
      ],
    },
    {
      name: 'color',
      content: [
        {
          type: 'hierarchy',
          datasetId: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          set: 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3',
          columnId: 'd34c49d9-8689-4e0f-a613-7add94d90b41',
          column: 'd34c49d9-8689-4e0f-a613-7add94d90b41',
          label: { en: 'Region' },
          lowestLevel: 0,
          format: '',
          level: null,
          id: '7068393c-ece4-471b-9842-6c775aacdfcb',
        },
      ],
    },
  ],
  options: {
    theme: { ...NEWSPAPER_DARK_THEME },
    loader: { ...NEWSPAPER_DARK_LOADER_OPTIONS },
    display: { title: false, legend: false },
    grid: {
      x: { enabled: false },
      y: { enabled: false },
    },
    axislabels: {
      x: { enabled: false, position: 'center' },
      y: { enabled: false, position: 'middle' },
    },
    axis: {
      x: { ticksMode: 'ticks', color: 'rgb(138, 126, 114)' },
      y: { ticksMode: 'ticks', color: 'rgb(138, 126, 114)' },
    },
    interactivity: {
      availableExportTypes: [],
      brush: false,
      exportTypes: [],
    },
    legend: { position: 'bottom' },
    filter: {},
    limit: { number: 10000 },
    startWithSubType: 'scatter',
    title: { en: 'Scatter plot' }
  },
};
