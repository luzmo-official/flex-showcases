import { LuzmoNumberEvolutionWidget } from "./AlternativeComponents/LuzmoNumberEvolutionWidget/LuzmoNumberEvolutionWidget";

/* Type imports */
import {
  DateTimeAggregationColumn,
  DatetimeColumn,
  DatetimeLevel,
  HierarchyAggregationColumn,
  NumericAggregationColumn,
  NumericColumn,
} from "./AlternativeTypes/ColumnTypes";
import { LocalizedString } from "./AlternativeTypes/MutualTypes";
import { EvolutionSlot, MeasureSlot } from "./AlternativeTypes/SlotTypes";

export function ExampleUsage() {
  const widgetTitle: LocalizedString = {
    en: "My beautiful title",
  };

  // Create a numeric column
  const numericColumn: NumericColumn = {
    datasetId: "datasetId",
    columnId: "columnId",
    format: ",.0a%",
  };

  // Use numeric column as an average aggregation
  const averageNumericColumn: NumericAggregationColumn = {
    ...numericColumn,
    aggregation: "average",
  };

  // Create a datetime column
  const dateColumn: DatetimeColumn = {
    datasetId: "datasetId",
    columnId: "columnId",
    level: DatetimeLevel.day,
  };

  function createMeasureSlot(
    aggregationColumn:
      | NumericAggregationColumn
      | DateTimeAggregationColumn
      | HierarchyAggregationColumn
  ): MeasureSlot {
    // Use the average numeric aggregation for measure slot of widget
    const measureSlot: MeasureSlot = {
      column: aggregationColumn,
    };

    return measureSlot;
  }

  function createEvolutionSlot(dateColumn: DatetimeColumn): EvolutionSlot {
    // Use the datetime column for evolution slot of widget
    const evolutionSlot: EvolutionSlot = {
      column: dateColumn,
    };

    return evolutionSlot;
  }

  return (
    <LuzmoNumberEvolutionWidget
      style={{ width: "100%", height: "10rem" }}
      measure={createMeasureSlot(averageNumericColumn)}
      evolution={createEvolutionSlot(dateColumn)}
      widgetTitle={widgetTitle}
    ></LuzmoNumberEvolutionWidget>
  );
}
