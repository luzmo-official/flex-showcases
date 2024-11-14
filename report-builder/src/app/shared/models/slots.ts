export type SlotName =
  | 'x-axis'
  | 'y-axis'
  | 'category'
  | 'measure'
  | 'coordinates'
  | 'legend'
  | 'geo'
  | 'image'
  | 'color'
  | 'levels'
  | 'slidermetric'
  | 'dimension'
  | 'destination'
  | 'source'
  | 'time'
  | 'identifier'
  | 'target'
  | 'size'
  | 'name'
  | 'columns'
  | 'column'
  | 'row'
  | 'evolution'
  | 'close'
  | 'open'
  | 'low'
  | 'high'
  | 'order'
  | 'route';

export type ColumnType = 'numeric' | 'hierarchy' | 'datetime' | 'spatial';

export type ColumnSubtype = 'duration' | 'currency' | 'coordinates' | 'hierarchy_element_expression' | 'topography';

export type FormulaType = 'hierarchy' | 'numeric' | 'datetime';

export type FormulaSubtype = 'duration' | 'currency' | 'date' | 'datetime';

/**
 * Basic aggregation query type
 */
export type BasicItemQueryAggregation = 'count' | 'distinctcount';

/**
 * Aggregation query type
 */
export type ItemQueryAggregation = BasicItemQueryAggregation
| 'sum'
| 'cumulativesum'
| 'average'
| 'median'
| 'min'
| 'max'
| 'stddev'
| 'weightedaverage'
| 'rate'
| 'histogram';

export type DatetimeDisplayMode =
  'default'
  | 'weekday_number'
  | 'weekday_name'
  | 'day_in_month'
  | 'day_in_year'
  | 'month_name'
  | 'month_number'
  | 'week_number'
  | 'second_in_minute'
  | 'minute_in_hour'
  | 'hour_in_day'
  | 'quarter_number';

export interface GenericSlotContent {
  /**
   * Column / Formula type
   */
  type?: ColumnType | FormulaType;

  /**
   * Column subtype
   */
  subtype?: ColumnSubtype | FormulaSubtype | null; // Note: it can be number or null in the runtime dashboard contents JSON.

  /**
   * Label in format {locale: "label"}, for example, {en: "Total Revenue"}
   * @TJS-type object
   */
  label?: Record<string, string>;

  /**
   * Dataset id
   * @format uuid
   * @TJS-ignore
   * @deprecated use datasetId instead.
   */
  set?: string;

  /**
   * Column id
   * @format uuid
   * @TJS-ignore
   * @deprecated use columnId instead.
   */
  column?: string;

  /**
   * A dataset formula id or an ad-hoc formula. A formula is an entity similar to a column. You can add formulas on the dataset details page or use ad-hoc formulas. You can find more information about formulas in the article https://academy.luzmo.com/article/52tm82oo
   */
  formula?: string;

  /**
   * Dataset id
   * @format uuid
   */
  datasetId?: string; // ONLY for libraries for now. set is renamed to datasetId, we upgrade filter object when events are sent out from the application to the libraries.

  /**
   * Column id
   * @format uuid
   */
  columnId?: string; // ONLY for libraries for now. column is renamed to columnId, we upgrade filter object when events are sent out from the application to the libraries.

  /**
   * D3 format, it is used for "numeric" formatting (https://observablehq.com/@d3/d3-format), for "datetime" formatting (https://d3js.org/d3-time-format).
   * It can also be used for "hierarchy" formatting but when it's used in the measure slot.
   */
  format?: string;

  /**
   * Currency code, for example "€" or "$". It is only used when the column type is "numeric" and subtype is "currency".
   */
  currency?: string | null;

  /**
   * Aggregation function. It can be used with a "numeric" column type, and with some limitations with "hierarchy" and "datetime" column types.
   */
  aggregationFunc?: ItemQueryAggregation;

  /**
   * Aggregation weight. It can be used with a "numeric" column type.
   */
  aggregationWeight?: {
    /**
     * Dataset id
     * @format uuid
     * @TJS-ignore
     * @deprecated use datasetId instead.
     */
    set: string;
    /**
     * Column id
     * @format uuid
     * @TJS-ignore
     * @deprecated use columnId instead.
     */
    column: string;
    /**
     * Dataset id
     * @format uuid
     */
    datasetId?: string; // ONLY for libraries for now. set is renamed to datasetId, we upgrade filter object when events are sent out from the application to the libraries.
    /**
     * Column id
     * @format uuid
     */
    columnId?: string; // ONLY for libraries for now. column is renamed to columnId, we upgrade filter object when events are sent out from the application to the libraries.
    /**
     * Column subtype
     */
    columnSubType: ColumnSubtype;
  };

  /**
   * Color of the column. Any column type can have it, but it's applied when a column is set as a measure and when multiple measures are defined.
   */
  color?: string | null;

  /**
   * "hierarchy" or "datetime" level
   * @TJS-type ["number", "null"]
   */
  level?: number | null; // Note: it can be number or null in the runtime dashboard contents JSON.

  /**
   * Lowest "hierarchy" or "datetime" level
   */
  lowestLevel?: number | null;

  /**
   * Bin definition. It can be used when a "numeric" column is used as a category.
   */
  bins?: {
    /**
     * Enable or disable binning
     */
    enabled: boolean;
    /**
     * Defines the range of the bins
     */

    number?: number;
  };

  /**
   * Duration definition. It's only used when the column type is "numeric" and subtype is "duration".
   */
  duration?: {
    /**
     * Duration levels used
     */
    levels: number[];
    /**
     * Duration format
     */
    format: 'short' | 'long' | 'time';
  };

  /**
   * Enable or disable grand totals, they're only used in Pivot table
   */
  grandTotals?: { enabled: boolean };

  /**
   * Shows empty areas for geo slots (with the name "geo" and content type 'spacial).
   * Also, it can be set in the options' advanced settings of the Choropleth map.
   */
  include_nonoccurring?: boolean; // Used in geo slots

  /**
   * If it's set it will be used for datetime formatting together with weekStart, weekDayNameFormat, monthNameFormat
   */
  datetimeDisplayMode?: DatetimeDisplayMode;

  /**
   * Week start day, 'sunday' or 'monday'. For datetime column formatting.
   */
  weekStart?: 'sunday' | 'monday';

  /**
   * Week day name format for datetime column formatting
   */
  weekDayNameFormat?: 'long' | 'short' | 'letter';

  /**
   * Month name format for datetime column formatting
   */
  monthNameFormat?: 'long' | 'short' | 'letter';

  // Slot options for internal use, they're also ignored in the JSON schema (@TJS-ignore):

  /**
   * It's something that is used internally for Demo Data
   * @TJS-ignore
   */
  cardinality?: number;

  /**
   * It's used internally for drilldown interactivity
   * @TJS-ignore
   */
  drilldownColumn?: GenericSlotContent;

  /**
   * It's used internally for drilldown interactivity
   * @TJS-ignore
   */
  drilldownLevel?: number;

  /**
   * Id of the slot. It's used in some cases but for internal needs.
   * @format uuid
   * @TJS-ignore
   */
  id?: string;

  /**
   * Index of the slot. It's used in some cases but for internal needs.
   * @TJS-ignore
   */
  index?: number;

  /**
   * It's used internally for 'datetime' tupe
   * @TJS-ignore
   */
  multi?: boolean; // datetime

  /**
   * The name of the slot. It's used in some cases but for internal needs.
   * @TJS-ignore
   */
  slotName?: string;

  /**
   * It's used in some cases but for internal needs.
   * @TJS-ignore
   */
  sortableIndex?: number;

  /**
   * It's used in some cases but for internal needs.
   * @TJS-ignore
   */
  sortableSelected?: boolean;

  /**
   * It's used internally in parallel-coordinates-plot
   * @TJS-ignore
   */
  sortOrder?: number | string;

  /**
   * It's something that is used internally by line-chart-forecast
   * @TJS-ignore
   */
  model?: any;
  /**
   * Settings to configure period over period comparison. It can be used only in a measure slot.
   */
  periodOverPeriod?: {
    /**
     * Period over period comparison type:
     * 'none' - turned off,
     * 'past' - absolute value comparison to the past,
     * 'change' - percentage change comparison to the past
     */
    type: 'none' | 'past' | 'change';
    /**
     * Period of time level
     * 0 - period, 1 - year, 2 - quarter, 3 - month, 4 - week, 5 - day... 9 - millisecond
     */
    level: number;
    /**
     * Number of periods
     */
    quantity: number;
    /**
     * Turn ON/OFF period to date comparison
     */
    periodToDate: boolean;
    /**
     * Category date level to disallow smaller Period-Over-Period levels. For internal use only
     * @TJS-ignore
     */
    minLevel: number;
  };
}

export type Slot = {
  /**
   * Name of the slot
   */
  name?: SlotName;
  /**
   * Label in format {locale: "label"}, for example, {en: "Total Revenue"} or just a string
   */
  label?: string | Record<string, string>;
  /**
   * Description of the slot (should be usable for AI generation purposes)
   * @TJS-ignore
   */
  description?: string;
  /**
   * Type of the slot
   * @examples ["numeric", "categorical", "mixed"]
   */
  type?: 'numeric' | 'categorical' | 'mixed';
  /**
   * Order of importance of slots, eg. a category slot is more important than a legend slot. This property is used when changing chart types
   */
  order?: number;
  /**
   * The data types the slot accepts
   * @examples ["numeric", "hierarchy"]
   */
  acceptableColumnTypes?: (ColumnType | FormulaType)[];
  /**
   * Used when type is spatial, but you can eg. only use topography (choropleth-map)
   * @examples ["topography"]
   */
  acceptableColumnSubtypes?: (ColumnSubtype | FormulaSubtype)[];
  /**
   * Whether a formula can be used
   */
  canAcceptFormula?: boolean;
  /**
   * Content of the slot
   */
  content?: GenericSlotContent[];
  rotate?: boolean;
  /**
   * Whether you can add multiple columns to the slot
   */
  canAcceptMultipleColumns?: boolean;
  requiredMinimumColumnsCount?: number;
  /**
   * Whether this slot needs to be filled in order to show information
   */
  isRequired?: boolean;
  /**
   * Whether the slot is hidden
   */
  isHidden?: boolean;
  /**
   * If current slot has multiple true and any of the slot in the given array is filled, the current slot can't accept multiple columns
   * For e.g. in bar chart, measure slot can accept multiple but if legend slot is filled, it can't accept multiple, so a possible value for this property would be ["legend"]
   * @examples ["legend"]
   */
  noMultipleIfSlotsFilled?: SlotName[];
  options?: {
    /**
     * Check if binning is disabled for a numeric type column
     */
    isBinningDisabled?: boolean;
    /**
     * Check if aggregation is disabled for numeric or mixed type columns
     */
    isAggregationDisabled?: boolean;
    /**
     * Show grand totals, they're only used in Pivot table
     */
    areGrandTotalsEnabled?: boolean;
    /**
     * Show only first slot grand totals, they're only used in Pivot table
     */
    showOnlyFirstSlotGrandTotals?: boolean;
    /**
     * In case when a numeric column and a cumulative function can be used
     */
    isCumulativeSumEnabled?: boolean;
    /**
     * Show formatting options for datetime type columns
     */
    areDatetimeOptionsEnabled?: boolean;
    showOnlyFirstSlotContentOptions?: boolean;
  };
};
