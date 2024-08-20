import { VizItemOptions } from "@luzmo/react-embed";
import { Slot } from "@luzmo/shared-embed";
import { datetimeLevelToNumber } from "../../../helpers/luzmoHelpers";

export function getStepNumberWidgetSlots(datetimeLevel: string): Slot[] {
  const numericDatetimeLevel = datetimeLevelToNumber(datetimeLevel);

  const measureSlot: Slot = {
    name: "measure",
    content: [
      {
        column: "27978dfd-7218-40a4-88cf-59de2df91935",
        set: "1c759996-74fd-438d-bcba-eb58838a5b03",
        label: {
          en: `Number of steps by ${datetimeLevel}`,
        },
        type: "numeric",
        format: ",.3as",
      },
    ],
  };
  const evolutionSlot: Slot = {
    name: "evolution",
    content: [
      {
        column: "87680fa2-96d2-42cf-ae76-557c3996cdf2",
        set: "1c759996-74fd-438d-bcba-eb58838a5b03",
        label: {
          en: "Measurement datetime (Date)",
        },
        type: "datetime",
        lowestLevel: 9,
        level: numericDatetimeLevel,
      },
    ],
  };

  return [measureSlot, evolutionSlot];
}

export const stepNumberWidgetOptions: VizItemOptions = {
  showSubtitle: false,
  subtitle: {},
  showImage: false,
  imageMode: "icon",
  imageSize: 40,
  imageAsBackground: false,
  imageRounded: false,
  imageColor: "#5A5A5A",
  imageBackgroundOpacity: 50,
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
  },
  missingValue: {
    type: "no",
  },
};

export const stepNumberWidgetSlots: Slot[] = [
  {
    name: "measure",
    content: [
      {
        column: "27978dfd-7218-40a4-88cf-59de2df91935",
        set: "1c759996-74fd-438d-bcba-eb58838a5b03",
        label: {
          en: "Number of steps by day",
        },
        type: "numeric",
        format: ",.3as",
      },
    ],
  },
  {
    name: "evolution",
    content: [
      {
        column: "87680fa2-96d2-42cf-ae76-557c3996cdf2",
        set: "1c759996-74fd-438d-bcba-eb58838a5b03",
        label: {
          en: "Measurement datetime (Date)",
        },
        type: "datetime",
        // format: "%amd~%Y %H:%M:%S.%L",
        lowestLevel: 9,
        level: 5,
      },
    ],
  },
];
