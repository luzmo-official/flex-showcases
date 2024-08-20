import { VizItemOptions } from "@luzmo/react-embed";
import { Slots } from "@luzmo/react-embed";

export const areaChartOptions: VizItemOptions = {
  interpolation: "linear",
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
      active: true,
      measureIndexes: [1],
      scale: "linear",
      ticksMode: "ticks",
      type: "default",
    },
  },
  lines: {
    strokeWidth: 2,
    gradient: true,
  },
  markers: {
    enabled: false,
    size: 4,
  },
  interactivity: {
    brush: true,
    urlConfig: {
      target: "_blank",
      url: null,
    },
    exportTypes: ["xlsx", "csv", "png"],
    availableExportTypes: ["xlsx", "csv", "png"],
  },
  display: {
    title: true,
    legend: true,
  },
  legend: {
    position: "top",
  },
  filter: {},
  nullBreak: false,
  missingValue: {
    type: "manual",
    value: 0,
  },
  limit: {
    number: 10000,
  },
  title: {
    en: "Movement in past month",
  },
  mode: "grouped",
};

export const areaChartSlots: Slots = [
  {
    name: "measure",
    content: [
      {
        column: "27978dfd-7218-40a4-88cf-59de2df91935",
        set: "1c759996-74fd-438d-bcba-eb58838a5b03",
        label: {
          en: "Number of steps",
        },
        type: "numeric",

        format: ",.3as",
      },
      {
        column: "e4ad572c-34d8-4af4-a70f-3c4405da5dd0",
        set: "1c759996-74fd-438d-bcba-eb58838a5b03",
        label: {
          en: "Calories burned",
        },
        type: "numeric",

        format: ",.3as",
      },
    ],
  },
  {
    name: "x-axis",
    content: [
      {
        column: "87680fa2-96d2-42cf-ae76-557c3996cdf2",
        set: "1c759996-74fd-438d-bcba-eb58838a5b03",
        label: {
          en: "Date",
        },
        type: "datetime",

        format: "%a %e %b %Y",
        lowestLevel: 9,
        level: 5,
      },
    ],
  },
];
