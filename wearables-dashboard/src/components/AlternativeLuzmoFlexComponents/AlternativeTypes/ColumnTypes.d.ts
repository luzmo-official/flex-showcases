import { NonNumericAggregation, NumericAggregation } from "./MutualTypes";

// Static for now, but should ideally follow formatting rules (also based on type?)
export type NumericSlotFormat = ",.0a%";

export enum DatetimeLevel {
  "year" = 1,
  "quarter" = 2,
  "month" = 3,
  "week" = 4,
  "day" = 5,
  "hour" = 6,
  "minute" = 7,
  "second" = 8,
  "millisecond" = 9,
}

/**
 * Represents a column in a dataset.
 */
export interface Column {
  /**
   * The ID of the column.
   */
  columnId: string;

  /**
   * The ID of the dataset.
   */
  datasetId: string;

  /**
   * The type of the column.
   */
  type: "numeric" | "datetime" | "hierarchy";

  /**
   * The format of the column (Needs to be extended with all formats)
   */
  format?: NumericSlotFormat | string;
}

/**
 * Represents a number column.
 */
export interface NumericColumn extends Column {
  type?: "numeric";
  /**
   * The format of the number column.
   */
  format?: NumericSlotFormat;
}

/**
 * Represents a hierarchy column.
 */
export interface HierarchyColumn extends Column {
  type?: "hierarchy";
  /**
   * The level of the hierarchy column.
   */
  level: number;
}

/**
 * Represents a datetime column.
 */
export interface DatetimeColumn extends Column {
  type?: "datetime";
  /**
   * The level of the datetime column.
   */
  level: DatetimeLevel;
}

/**
 * Represents a number aggregation column.
 */
export interface NumericAggregationColumn extends NumericColumn {
  /**
   * The type of aggregation for the number column.
   * Possible values: "sum", "avg", "min", "max", "count", "distinctcount".
   */
  aggregation: NumericAggregation;
}

/**
 * Represents a hierarchy aggregation column.
 */
export interface HierarchyAggregationColumn extends HierarchyColumn {
  /**
   * The type of aggregation for the hierarchy column.
   * Possible values: "count", "distinctcount".
   */
  aggregation: NonNumericAggregation;
}

/**
 * Represents a datetime aggregation column.
 */
export interface DateTimeAggregationColumn extends DatetimeColumn {
  /**
   * The type of aggregation for the datetime column.
   * Possible values: "count", "distinctcount".
   */
  aggregation: NonNumericAggregation;
}
