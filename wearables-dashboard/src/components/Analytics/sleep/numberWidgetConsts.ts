import { VizItemOptions } from "@luzmo/react-embed";
import { Slots } from "@luzmo/react-embed";

export const numberWidgetOptions: VizItemOptions = {
  showTitle: false,
  showSubtitle: false,
  subtitle: {},
  showImage: false,
  imageMode: "icon",
  imageSize: 40,
  imageAsBackground: false,
  imageRounded: false,
  imageColor: "#5A5A5A",
  imageBackgroundOpacity: 50,
  titlePosition: "top",
  subtitlePosition: "bottom",
  imagePosition: "left",
  horizontalAlignment: "center",
  verticalAlignment: "middle",
  evolutionGraphDisplay: "background",
  evolutionGraphType: "area",
  evolutionGraphOpacity: 35,
  evolutionGraphInterpolation: "linear",
  evolutionColor: "normal",
  link: {
    tooltip: {},
  },
  interactivity: {
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
            column: "d0ff1497-fa36-4dce-9480-a03e2f65c5ee",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            label: {
              en: "Avg sleep score",
            },
            type: "numeric",

            format: ",.0a%",
            aggregationFunc: "average",
            readonly: true,
            selected: true,
          },
        ],
        allowMultiple: false,
      },
      {
        slot: "evolution",
        description: "Evolution",
        order: 9999,
        values: [
          {
            column: "42b49ce5-b7eb-4d97-8d3d-35a1ce873e14",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            label: {
              en: "Day",
            },
            type: "datetime",

            format: "%amd~%Y %H:%M:%S.%L",
            lowestLevel: 9,
            level: 5,
            readonly: true,
            selected: true,
          },
          {
            column: "42b49ce5-b7eb-4d97-8d3d-35a1ce873e14",
            formula: null,
            label: {
              en: "Week",
            },
            type: "datetime",

            lowestLevel: 9,
            color: "#3182bd",
            set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
            format: "%amd~%Y %H:%M:%S.%L",
            level: 4,
            readonly: false,
            selected: false,
          },
        ],
        allowMultiple: false,
      },
    ],
  },
  display: {
    title: false,
  },
  missingValue: {
    type: "no",
  },
  // title: "Average sleep score in last day",
};

export const numberWidgetSlots: Slots = [
  {
    name: "measure",
    content: [
      {
        column: "d0ff1497-fa36-4dce-9480-a03e2f65c5ee",
        set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        label: {
          en: "Avg sleep score",
        },
        type: "numeric",

        format: ",.0a%",
        aggregationFunc: "average",
      },
    ],
  },
  {
    name: "evolution",
    content: [
      {
        column: "42b49ce5-b7eb-4d97-8d3d-35a1ce873e14",
        set: "f0e0df8c-87fc-4bdc-ab7f-8cd744146284",
        label: {
          en: "Yesterday vs day before",
        },
        type: "datetime",

        format: "%amd~%Y %H:%M:%S.%L",
        lowestLevel: 9,
        level: 5,
      },
    ],
  },
];
