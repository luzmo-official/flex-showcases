import { VizItemOptions } from "@luzmo/react-embed";
import { Slots } from "@luzmo/react-embed";

export const circleGaugeOptions: VizItemOptions = {
  circle: {
    degrees: 360,
    flip: false,
  },
};

export const circleGaugeSlots: Slots = [
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
];
