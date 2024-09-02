import { Slots, VizItemOptions } from "@luzmo/react-embed";

export const heatTableSlots: Slots = [
  {
    name: "y-axis",
    content: [
      {
        column: "42b49ce5-b7eb-4d97-8d3d-35a1ce873e14",
        set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        label: {
          en: "Day in week",
        },
        type: "datetime",

        format: "%amd~%Y %H:%M:%S.%L",
        lowestLevel: 9,
        level: 5,
        datetimeDisplayMode: "weekday_name",
        weekStart: "monday",
        weekDayNameFormat: "long",
      },
    ],
  },
  {
    name: "measure",
    content: [
      {
        column: "d0ff1497-fa36-4dce-9480-a03e2f65c5ee",
        set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        label: {
          en: "Average sleep score",
        },
        type: "numeric",

        format: ",.0a%",
        aggregationFunc: "average",
      },
    ],
  },
  {
    name: "x-axis",
    content: [
      {
        column: "42b49ce5-b7eb-4d97-8d3d-35a1ce873e14",
        set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        label: {
          en: "Hour in day",
        },
        type: "datetime",

        format: "%amd~%Y %H:%M:%S.%L",
        lowestLevel: 9,
        level: 6,
        datetimeDisplayMode: "hour_in_day",
      },
    ],
  },
];

export const heattableOptions: VizItemOptions = {
  axislabels: {
    x: {
      enabled: false,
      position: "center",
    },
    y: {
      enabled: false,
      position: "middle",
    },
  },
  axis: {
    x: {
      ticksMode: "ticks",
    },
    y: {
      ticksMode: "ticks",
    },
  },
  classification: "quantile",
  colorsClass: "YlGnBu",
  colorsType: "sequential",
  display: {
    title: false,
  },
  filter: {},
  values: {
    display: true,
  },
  heattable: {
    opacity: 1,
    rounding: null,
    spacing: null,
  },
  interactivity: {
    select: false,
    urlConfig: {
      target: "_blank",
      url: null,
    },
    exportTypes: ["xlsx", "csv", "png"],
    availableExportTypes: ["xlsx", "csv", "png"],
    customTooltip: null,
    measureDimensionPicker: [
      {
        slot: "measure",
        description: "Measure",
        acceptFormula: true,
        order: 0,
        values: [
          {
            column: "d0ff1497-fa36-4dce-9480-a03e2f65c5ee",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            label: {
              en: "Average sleep score",
            },
            type: "numeric",

            format: ",.0a%",
            aggregationFunc: "average",
            readonly: true,
            selected: true,
          },
          {
            column: "d0ff1497-fa36-4dce-9480-a03e2f65c5ee",
            formula: null,
            label: {
              en: "Max sleep score",
            },
            type: "numeric",

            lowestLevel: 0,
            color: "#c6dbef",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            format: ",.0a%",
            columnHierarchies: null,
            aggregationFunc: "max",
            selected: false,
          },
        ],
        allowMultiple: false,
      },
      {
        slot: "y-axis",
        description: "Y axis",
        order: 1,
        values: [
          {
            column: "42b49ce5-b7eb-4d97-8d3d-35a1ce873e14",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            label: {
              en: "Day in week",
            },
            type: "datetime",

            format: "%amd~%Y %H:%M:%S.%L",
            lowestLevel: 9,
            level: 5,
            datetimeDisplayMode: "weekday_name",
            weekStart: "monday",
            weekDayNameFormat: "long",
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
            column: "42b49ce5-b7eb-4d97-8d3d-35a1ce873e14",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            label: {
              en: "Hour in day",
            },
            type: "datetime",

            format: "%amd~%Y %H:%M:%S.%L",
            lowestLevel: 9,
            level: 6,
            datetimeDisplayMode: "hour_in_day",
            readonly: true,
            selected: true,
          },
          {
            column: "364eb521-f4e5-461b-b465-e06e121ff5fd",
            formula: null,
            label: {
              en: "Sleep hours",
            },
            type: "hierarchy",

            lowestLevel: null,
            color: null,
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            format: "",
            readonly: false,
            selected: false,
          },
        ],
        allowMultiple: false,
      },
    ],
  },
  numberClasses: 7,
  sort: {
    x: {
      by: "category",
      order: "asc",
    },
    y: {
      by: "category",
      order: "asc",
    },
  },
  limit: {
    number: 1000,
  },
  title: {
    en: "Average sleep score by day of week and hour in day",
  },
};
