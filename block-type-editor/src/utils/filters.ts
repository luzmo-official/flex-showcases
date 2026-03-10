/**
 * Filter transformation utilities for converting between
 * edit-filters format and luzmo-embed-viz-item format.
 */

export interface FilterGroup {
  condition: "AND" | "OR";
  filters: (FilterCondition | FilterGroup)[];
}

export interface FilterCondition {
  expression?: string;
  parameters?: unknown[];
}

export interface TransformedFilterGroup {
  condition: "and" | "or";
  filters: unknown[];
  subGroups?: TransformedFilterGroup[];
}

/**
 * Type guard to check if an item is a FilterGroup (has condition and filters)
 */
export const isFilterGroup = (item: unknown): item is FilterGroup =>
  item !== null &&
  typeof item === "object" &&
  "condition" in item &&
  "filters" in item;

/**
 * Transform FilterGroup from edit-filters to the format expected by luzmo-embed-viz-item
 */
export const transformFilterGroup = (
  group: FilterGroup | null
): TransformedFilterGroup => {
  if (!group || !group.filters) {
    return {
      condition: "and",
      filters: [],
      subGroups: [],
    };
  }

  const normalFilters: unknown[] = [];
  const subGroups: TransformedFilterGroup[] = [];

  for (const filter of group.filters) {
    if (isFilterGroup(filter)) {
      subGroups.push(transformFilterGroup(filter as FilterGroup));
    } else {
      normalFilters.push(filter);
    }
  }

  const condition = (group.condition?.toLowerCase() === "or" ? "or" : "and") as
    | "and"
    | "or";

  return {
    condition,
    filters: normalFilters,
    subGroups,
  };
};

/**
 * Get active filters in the format expected by luzmo-embed-viz-item
 */
export const getActiveFilters = (
  rawFilters: FilterGroup | null
): TransformedFilterGroup[] => {
  if (!rawFilters) {
    return [];
  }
  return [transformFilterGroup(rawFilters)];
};
