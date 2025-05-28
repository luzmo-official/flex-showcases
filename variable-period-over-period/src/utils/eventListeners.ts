import type {
  DashboardRow,
  DashboardView,
  DashboardItem,
  FilterGroup,
  EventFilterEntry,
  ChangedFiltersEventDetail,
  ItemSlot,
} from "../types/dashboard";
import type { ItemWithRelevantFormulas, Formula } from "./formulaUtils";

interface ViewLoadState {
  item1Id?: string;
  item2Id?: string;
  item1Loaded: boolean;
  item2Loaded: boolean;
  item1Ref?: any;
  item2Ref?: any;
}

interface DateRange {
  startDate?: string;
  endDate?: string;
}

// Helper to create a deep copy of slots
/**
 * Creates a deep copy of an array of ItemSlot objects.
 * This is used to prevent modifications to the original slot objects.
 * @param slots - The array of ItemSlot objects to copy.
 * @returns A new array containing deep copies of the original ItemSlot objects.
 */
function deepCopySlots(slots: ItemSlot[]): ItemSlot[] {
  return JSON.parse(JSON.stringify(slots));
}

/**
 * Formats a JavaScript date string into a SQL DATETIME format (YYYY-MM-DD HH:MM:SS).
 * If the input string is undefined or cannot be parsed, it returns undefined.
 * @param dateString - The date string to format.
 * @returns The formatted SQL DATETIME string or undefined if formatting fails.
 */
function formatDateToSQL(dateString?: string): string | undefined {
  if (!dateString) return undefined;
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.warn(`Could not parse date string: ${dateString}`, e);
    return undefined; // Or return original string if preferred
  }
}

// Helper function to apply date-injected formulas to an item's slots
/**
 * Modifies the formulas within an item's slots by injecting specific start and end dates.
 * It takes original slots, relevant formulas, and sorted date ranges, then replaces
 * placeholder strings in formula expressions with actual date values.
 * @param originalSlots - The original array of ItemSlot objects for an item.
 * @param itemRelevantFormulas - An array of Formula objects relevant to this item.
 * @param sortedDateRanges - An array of two DateRange objects, [compareRange, baseRange], sorted by start date.
 * @returns A new array of ItemSlot objects with modified formulas.
 */
function getModifiedSlots(
  originalSlots: ItemSlot[],
  itemRelevantFormulas: Formula[],
  sortedDateRanges: DateRange[]
): ItemSlot[] {
  if (sortedDateRanges.length < 2) {
    console.warn("Not enough date ranges to apply formulas.");
    return originalSlots;
  }

  const newSlots = deepCopySlots(originalSlots);
  const baseStartDate = formatDateToSQL(sortedDateRanges[1]?.startDate);
  const baseEndDate = formatDateToSQL(sortedDateRanges[1]?.endDate);
  const compareStartDate = formatDateToSQL(sortedDateRanges[0]?.startDate);
  const compareEndDate = formatDateToSQL(sortedDateRanges[0]?.endDate);

  newSlots.forEach((slot) => {
    if (slot.content) {
      slot.content.forEach((contentItem) => {
        if (contentItem.formula) {
          const relevantFormula = itemRelevantFormulas.find(
            (rf) => rf.id === contentItem.formula
          );
          if (relevantFormula) {
            let modifiedExpression = relevantFormula.expression;
            const originalExpression = relevantFormula.expression; // Store original for logging

            if (baseStartDate) {
              modifiedExpression = modifiedExpression.replace(
                /CAST\('BASE_DATE_START', datetime\)/g,
                `'${baseStartDate}'`
              );
            }
            if (baseEndDate) {
              modifiedExpression = modifiedExpression.replace(
                /CAST\('BASE_DATE_END', datetime\)/g,
                `'${baseEndDate}'`
              );
            }
            if (compareStartDate) {
              modifiedExpression = modifiedExpression.replace(
                /CAST\('COMPARE_DATE_START', datetime\)/g,
                `'${compareStartDate}'`
              );
            }
            if (compareEndDate) {
              modifiedExpression = modifiedExpression.replace(
                /CAST\('COMPARE_DATE_END', datetime\)/g,
                `'${compareEndDate}'`
              );
            }

            // Log if the expression was changed
            if (modifiedExpression !== originalExpression) {
              console.log(
                `Formula ID '${relevantFormula.id}' updated for item. Original: '${originalExpression}', New: '${modifiedExpression}'`
              );
            }
            contentItem.formula = modifiedExpression;
          }
        }
      });
    }
  });
  return newSlots;
}

/**
 * Extracts a date string from a filter entry's parameters.
 * It checks different possible structures within the parameters array for a valid date string.
 * @param entry - The EventFilterEntry object to extract the date from.
 * @returns The extracted date string, or undefined if no valid date string is found.
 */
function extractDateFromFilterEntry(
  entry: EventFilterEntry
): string | undefined {
  if (
    Array.isArray(entry.parameters) &&
    entry.parameters.length > 1 &&
    typeof entry.parameters[1] === "string" &&
    entry.parameters[1].length > 0
  ) {
    return entry.parameters[1] as string;
  }
  if (
    Array.isArray(entry.parameters) &&
    entry.parameters.length > 1 &&
    Array.isArray(entry.parameters[1]) &&
    entry.parameters[1].length > 0 &&
    typeof entry.parameters[1][0] === "string"
  ) {
    return entry.parameters[1][0] as string;
  }
  return undefined;
}

/**
 * Extracts a start and end date from a FilterGroup if it matches the targetItemId.
 * It iterates through the filters in the group, looking for expressions that define
 * a start date ('>=') or end date ('<=').
 * @param filterGroup - The FilterGroup object to process.
 * @param targetItemId - The ID of the dashboard item to match against the filterGroup's vizId.
 * @returns A DateRange object containing the startDate and/or endDate, or null if the vizId doesn't match or no dates are found.
 */
function extractDateRangeFromFilterGroup(
  filterGroup: FilterGroup,
  targetItemId: string
): DateRange | null {
  if (filterGroup.vizId !== targetItemId) {
    return null;
  }

  let startDate: string | undefined;
  let endDate: string | undefined;

  if (filterGroup.filters && filterGroup.filters.length > 0) {
    filterGroup.filters.forEach((entry: EventFilterEntry) => {
      const dateStr = extractDateFromFilterEntry(entry);
      if (dateStr) {
        if (entry.expression === "? >= ?") {
          startDate = dateStr;
        } else if (entry.expression === "? <= ?") {
          endDate = dateStr;
        }
      }
    });
  }

  if (startDate || endDate) {
    return { startDate, endDate };
  }
  return null;
}

/**
 * Processes an array of FilterGroup objects to extract date ranges for two specific item IDs,
 * then filters and sorts these date ranges.
 * The sorting is primarily by startDate, and secondarily by endDate if startDates are equal.
 * @param filterGroups - An array of FilterGroup objects, typically from a 'changedFilters' event.
 * @param item1Id - The ID of the first date filter item.
 * @param item2Id - The ID of the second date filter item.
 * @returns An array of DateRange objects, sorted by startDate (and then endDate).
 */
function processAndSortDateRanges(
  filterGroups: FilterGroup[],
  item1Id: string,
  item2Id: string
): DateRange[] {
  const dateRanges: DateRange[] = [];

  filterGroups.forEach((group) => {
    const range1 = extractDateRangeFromFilterGroup(group, item1Id);
    if (range1) dateRanges.push(range1);

    const range2 = extractDateRangeFromFilterGroup(group, item2Id);
    if (range2) dateRanges.push(range2);
  });

  return dateRanges
    .filter(
      (range) => range.startDate !== undefined || range.endDate !== undefined
    )
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return dateA - dateB;
    });
}

/**
 * Sets up event listeners for date filter items within a dashboard view.
 * It identifies two date filter items in each view and configures listeners for their 'load'
 * and 'changedFilters' events. These listeners are responsible for extracting date ranges,
 * processing them, and then updating other visualization items in the same view by
 * injecting these dates into their formulas via their 'slots' attribute.
 * @param dashboardRow - The DashboardRow object containing the structure of the dashboard.
 * @param dashboardElement - The root HTMLElement of the dashboard.
 * @param itemsWithFormulas - An array of ItemWithRelevantFormulas, mapping item IDs to their formulas
 *                            that need date injection.
 */
export function setupDateFilterListeners(
  dashboardRow: DashboardRow,
  dashboardElement: HTMLElement,
  itemsWithFormulas: ItemWithRelevantFormulas[]
) {
  if (!dashboardRow?.contents?.views) {
    console.warn("Dashboard data is not available for setting up listeners.");
    return;
  }

  const itemFormulasMap = new Map<string, Formula[]>();
  itemsWithFormulas.forEach((entry) => {
    itemFormulasMap.set(entry.item.id, entry.formulas);
  });

  const viewLoadStates = new Map<number, ViewLoadState>();

  dashboardRow.contents.views.forEach(
    (view: DashboardView, viewIndex: number) => {
      const viewElement = dashboardElement.children[viewIndex] as HTMLElement;
      if (!viewElement) {
        console.warn(
          `View element for screenModus '${view.screenModus}' (index ${viewIndex}) not found. Skipping listener setup for this view.`
        );
        return;
      }

      const dateFilterItems = view.items.filter(
        (item: DashboardItem) => item.type === "date-filter"
      );

      if (dateFilterItems.length === 2) {
        const item1Definition = dateFilterItems[0];
        const item2Definition = dateFilterItems[1];

        if (!item1Definition?.id || !item2Definition?.id) {
          console.warn(
            `One or both date filter items in view ${view.screenModus} are missing an ID. Skipping.`
          );
          return;
        }

        const currentItem1Id = item1Definition.id;
        const currentItem2Id = item2Definition.id;

        viewLoadStates.set(viewIndex, {
          item1Id: currentItem1Id,
          item2Id: currentItem2Id,
          item1Loaded: false,
          item2Loaded: false,
        });

        const updateAllRelevantVizItemsInView = (
          sortedDateRanges: DateRange[],
          isInitialLoad: boolean
        ) => {
          if (sortedDateRanges.length < 2) {
            console.warn("Not enough date ranges available to update items.");
            return;
          }
          view.items.forEach((itemInView) => {
            if (itemInView.type !== "date-filter") {
              const relevantFormulasForItem = itemFormulasMap.get(
                itemInView.id
              );
              if (
                relevantFormulasForItem &&
                relevantFormulasForItem.length > 0
              ) {
                const originalItemDefinition = dashboardRow.contents.views[
                  viewIndex
                ]?.items.find((i) => i.id === itemInView.id);
                if (originalItemDefinition && originalItemDefinition.slots) {
                  const modifiedSlots = getModifiedSlots(
                    originalItemDefinition.slots,
                    relevantFormulasForItem,
                    sortedDateRanges
                  );
                  const vizItemComponent = viewElement.querySelector(
                    `luzmo-embed-viz-item[itemId="${itemInView.id}"]`
                  ) as any;

                  if (vizItemComponent) {
                    if (isInitialLoad) {
                      const applySlotsOnLoad = () => {
                        console.log(
                          `Item ${itemInView.id} (view ${view.screenModus}) loaded. Applying updated slots:`,
                          JSON.stringify(modifiedSlots)
                        );
                        vizItemComponent.setAttribute(
                          "slots",
                          JSON.stringify(modifiedSlots)
                        );
                      };
                      console.log(
                        `Item ${itemInView.id} (view ${view.screenModus}): Queuing slot update for next load event.`
                      );
                      vizItemComponent.addEventListener(
                        "load",
                        applySlotsOnLoad,
                        { once: true }
                      );
                    } else {
                      // Apply directly if not initial load
                      console.log(
                        `Updating slots for item ${itemInView.id} in view ${view.screenModus} with new dates (direct apply):`,
                        JSON.stringify(modifiedSlots)
                      );
                      vizItemComponent.setAttribute(
                        "slots",
                        JSON.stringify(modifiedSlots)
                      );
                    }
                  } else {
                    console.warn(
                      `Could not find viz item component for ID ${itemInView.id} in view ${view.screenModus} to update slots.`
                    );
                  }
                } else {
                  console.warn(
                    `Original item definition or slots not found for item ID ${itemInView.id}`
                  );
                }
              }
            }
          });
        };

        const handleChangedFilters = (event: Event) => {
          const customEvent = event as CustomEvent<ChangedFiltersEventDetail>;
          const allDashboardFilters = customEvent.detail?.filters;

          if (allDashboardFilters) {
            const sortedDateRanges = processAndSortDateRanges(
              allDashboardFilters,
              currentItem1Id,
              currentItem2Id
            );
            console.log(
              `[ChangedFilters] Sorted Dates for view ${view.screenModus}:`,
              sortedDateRanges
            );
            updateAllRelevantVizItemsInView(sortedDateRanges, false);
          } else {
            console.warn(
              "Could not process changedFilters: missing allDashboardFilters."
            );
          }
        };

        const handleLoad = (loadedItemId: string, vizItemComponentRef: any) => {
          const currentViewState = viewLoadStates.get(viewIndex);
          if (
            !currentViewState ||
            !currentViewState.item1Id ||
            !currentViewState.item2Id
          ) {
            console.error("View load state missing after load event.");
            return;
          }

          if (loadedItemId === currentViewState.item1Id) {
            currentViewState.item1Loaded = true;
            currentViewState.item1Ref = vizItemComponentRef;
          } else if (loadedItemId === currentViewState.item2Id) {
            currentViewState.item2Loaded = true;
            currentViewState.item2Ref = vizItemComponentRef;
          }

          if (currentViewState.item1Loaded && currentViewState.item2Loaded) {
            const componentToGetFiltersFrom = currentViewState.item1Ref;
            if (componentToGetFiltersFrom?.getFilters) {
              try {
                const initialFilters: FilterGroup[] =
                  componentToGetFiltersFrom.getFilters();
                console.log(
                  `Initial raw filters for view ${view.screenModus} (from item ${currentItem1Id}):`,
                  initialFilters
                );
                const sortedDateRanges = processAndSortDateRanges(
                  initialFilters,
                  currentItem1Id,
                  currentItem2Id
                );
                console.log(
                  `[InitialLoad] Sorted Dates for view ${view.screenModus}:`,
                  sortedDateRanges
                );
                updateAllRelevantVizItemsInView(sortedDateRanges, true);
              } catch (e) {
                console.error(
                  `Error calling getFilters on item ${currentItem1Id}:`,
                  e
                );
              }
            } else {
              console.error(
                `getFilters method not found on item ${currentItem1Id}.`
              );
            }
          }
        };

        dateFilterItems.forEach((item: DashboardItem) => {
          if (!item.id) return;
          const vizItemComponent = viewElement.querySelector(
            `luzmo-embed-viz-item[itemId="${item.id}"]`
          ) as HTMLElement | null;

          if (vizItemComponent) {
            vizItemComponent.addEventListener(
              "changedFilters",
              handleChangedFilters
            );
            vizItemComponent.addEventListener("load", () =>
              handleLoad(item.id!, vizItemComponent)
            );
          } else {
            console.warn(
              `Could not find viz item for ID '${item.id}' in view ${view.screenModus}.`
            );
          }
        });
      }
    }
  );
}
