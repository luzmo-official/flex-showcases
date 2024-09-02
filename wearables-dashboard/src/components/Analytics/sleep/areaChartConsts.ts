import { VizItemOptions } from "@luzmo/react-embed";
import { Slots } from "@luzmo/react-embed";

export const areaChartOptions: VizItemOptions = {
  interpolation: "step-before",
  interactivity: {
    brush: true,
    urlConfig: {
      target: "_blank",
      url: null,
    },
    exportTypes: ["xlsx", "csv", "png"],
    availableExportTypes: ["xlsx", "csv", "png"],
    measureDimensionPicker: [
      {
        slot: "measure",
        description: "Measure",
        acceptFormula: true,
        order: 0,
        values: [
          {
            column: "1c7c6a34-0ab2-4853-9a71-b762a12812a1",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            label: {
              en: "Amount of sleep",
            },
            type: "numeric",
            subtype: "duration",
            format: ".0af",
            lowestLevel: 8,
            duration: {
              levels: [6, 7],
              format: "short",
            },
            readonly: true,
            selected: true,
          },
        ],
        allowMultiple: false,
      },
      {
        slot: "x-axis",
        description: "X axis",
        order: 1,
        values: [
          {
            column: "3fc71210-6362-4bf6-ba1b-d27d16b1c36d",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            label: {
              en: "Date",
            },
            type: "datetime",

            format: "%a %e %b %Y",
            lowestLevel: 5,
            level: 5,
            readonly: true,
            selected: true,
          },
        ],
        allowMultiple: false,
      },
      {
        slot: "legend",
        description: "Group by",
        order: 2,
        values: [
          {
            column: "59f0413e-b6d5-491f-a852-de198c0070bf",
            formula: null,
            label: {
              en: "Sleep score category",
            },
            type: "hierarchy",

            lowestLevel: 0,
            color: "#e6550d",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            format: "",
            selected: false,
          },
        ],
        allowMultiple: false,
      },
    ],
  },
  display: {
    title: false,
    legend: true,
    modeOption: false,
  },
  axislabels: {
    x: {
      enabled: false,
      position: "center",
    },
    y: {
      enabled: false,
      position: "middle",
    },
    y2: {
      enabled: false,
      position: "middle",
    },
  },
  axis: {
    x: {
      ticksMode: "ticks",
    },
    y: {
      scale: "linear",
      ticksMode: "ticks",
      type: "default",
    },
    y2: {
      active: false,
      measureIndexes: [1],
      scale: "linear",
      ticksMode: "ticks",
      type: "default",
    },
  },
  grid: {
    x: {
      enabled: false,
    },
    y: {
      enabled: false,
    },
    y2: {
      enabled: false,
    },
  },
  area: {},
  filter: {},
  mode: "stacked",
  legend: {
    position: "top",
  },
  nullBreak: false,
  missingValue: {
    type: "no",
  },
  limit: {
    number: 10000,
  },
  title: {
    en: "Stacked area chart",
  },
  guidelines: {
    lines: [
      {
        color: "rgba(0,0,0,.7)",
        type: "average",
      },
    ],
    style: {
      type: "3,3",
      width: "1",
    },
  },
};

export const areaChartSlots: Slots = [
  {
    name: "x-axis",
    content: [
      {
        column: "3fc71210-6362-4bf6-ba1b-d27d16b1c36d",
        set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        label: {
          en: "Date",
        },
        type: "datetime",

        format: "%a %e %b %Y",
        lowestLevel: 5,
        level: 5,
      },
    ],
  },
  {
    name: "measure",
    content: [
      {
        column: "1c7c6a34-0ab2-4853-9a71-b762a12812a1",
        set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        label: {
          en: "Amount of sleep",
        },
        type: "numeric",
        subtype: "duration",
        format: ".0af",
        lowestLevel: 8,
        duration: {
          levels: [6, 7],
          format: "short",
        },
      },
    ],
    originalContent: null,
  },
  {
    name: "legend",
    content: [],
  },
];
