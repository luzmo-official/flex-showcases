import { LuzmoVizItemComponent } from "@luzmo/react-embed";
import { Slot } from "@luzmo/shared-embed";

import { EvolutionSlot, MeasureSlot } from "../../AlternativeTypes/SlotTypes";

import { WidgetProps } from "../../AlternativeTypes/MutualTypes";
import { HTMLAttributes } from "react";

export interface NumberEvolutionWidgetProps extends WidgetProps {
  measure: MeasureSlot;
  evolution?: EvolutionSlot | undefined;
}

export function LuzmoNumberEvolutionWidget(
  props: NumberEvolutionWidgetProps & HTMLAttributes<HTMLElement>
) {
  const measureSlotContent: Slot[] = [
    {
      name: "measure",
      content: [
        {
          column: props.measure.column.columnId,
          set: props.measure.column.datasetId,
          label: props.title,
          type: props.measure.column.type,
          format: props.measure.column.format,
          aggregationFunc: props.measure.column.aggregation,
        },
      ],
    },
  ];

  console.log("[TEST] level enum result:", props.evolution?.column.level);

  const evolutionSlotContent: Slot[] = props.evolution
    ? [
        {
          name: "evolution",
          content: [
            {
              column: props.evolution.column.columnId,
              set: props.evolution.column.datasetId,
              type: props.evolution.column.type,
              level: props.evolution.column.level,
            },
          ],
        },
      ]
    : [];

  return (
    <LuzmoVizItemComponent
      {...props}
      appServer={props.appServer}
      apiHost={props.apiHost}
      authKey={props.authorization?.key}
      authToken={props.authorization?.token}
      dashboardId={props.dashboardId}
      itemId={props.itemId}
      slots={[...measureSlotContent, ...evolutionSlotContent]}
    ></LuzmoVizItemComponent>
  );
}
