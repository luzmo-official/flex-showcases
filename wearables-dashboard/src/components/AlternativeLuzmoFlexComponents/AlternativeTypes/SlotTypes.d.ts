import {
  NumericAggregationColumn,
  HierarchyAggregationColumn,
  DateTimeAggregationColumn,
  DatetimeColumn,
  // GroupByColumn,
} from "./ColumnTypes";

export interface MeasureSlot {
  column:
    | NumericAggregationColumn
    | HierarchyAggregationColumn
    | DateTimeAggregationColumn;
}

export interface EvolutionSlot {
  column: DatetimeColumn;
}
