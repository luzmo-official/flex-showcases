import type {
  DashboardRow,
  DashboardView,
  DashboardItem,
  FilterGroup,
  EventFilterEntry,
  ChangedFiltersEventDetail,
} from "../types/dashboard";

interface ViewLoadState {
  item1Id?: string;
  item2Id?: string;
  item1Loaded: boolean;
  item2Loaded: boolean;
  item1Ref?: any; // Using any to allow access to getFilters()
  item2Ref?: any; // Using any to allow access to getFilters()
}

interface DateRange {
  startDate?: string;
  endDate?: string;
}

/**
 * Extracts start and end dates from a filter group if it matches the target item ID
 * and contains the specific date filter expressions.
 * @param filterGroup The filter group to process.
 * @param targetItemId The ID of the date-filter item we are looking for.
 * @returns A DateRange object or null if not applicable.
 */
function extractDatesFromFilterGroup(
  filterGroup: FilterGroup,
  targetItemId: string
): DateRange | null {
  if (filterGroup.vizId !== targetItemId) {
    return null;
  }

  let startDate: string | undefined;
  let endDate: string | undefined;

  if (filterGroup.filters && filterGroup.filters.length > 0) {
    // console.log("filterGroup", filterGroup); // User's console log
    filterGroup.filters.forEach((entry: EventFilterEntry) => {
      // Updated condition based on user's finding that parameters[1] is a string
      if (
        Array.isArray(entry.parameters) &&
        entry.parameters.length > 1 && // Ensure parameters[1] exists
        typeof entry.parameters[1] === "string" && // Check if it's a string
        (entry.parameters[1] as string).length > 0 // Ensure non-empty string
      ) {
        const dateStr = entry.parameters[1] as string;
        if (entry.expression === "? >= ?") {
          startDate = dateStr;
        } else if (entry.expression === "? <= ?") {
          endDate = dateStr;
        }
      } else {
        console.warn(
          `Date filter entry for item ${targetItemId} has unexpected parameters structure or empty date string. Entry:`,
          entry
        );
      }
    });
  }

  if (startDate || endDate) {
    if (!startDate)
      console.warn(
        `Extracted end date but no start date for ${targetItemId}`,
        filterGroup
      );
    if (!endDate)
      console.warn(
        `Extracted start date but no end date for ${targetItemId}`,
        filterGroup
      );
    return { startDate, endDate };
  }

  if (filterGroup.vizId === targetItemId) {
    // Log if a matching vizId was found but dates weren't extracted as expected
    console.warn(
      `Filter group with vizId ${targetItemId} did not yield expected date structure. Filters:`,
      filterGroup.filters
    );
  }
  return null;
}

/**
 * Processes filter groups to extract and sort date ranges for two specified item IDs.
 * @param filterGroups - Array of filter groups to process.
 * @param item1Id - ID of the first date filter item.
 * @param item2Id - ID of the second date filter item.
 * @returns An array of DateRange objects, sorted by startDate (earliest first).
 */
function processAndSortDateRanges(
  filterGroups: FilterGroup[],
  item1Id: string,
  item2Id: string
): DateRange[] {
  const collectedDateRanges: DateRange[] = [];

  filterGroups.forEach((group: FilterGroup) => {
    const targetId = group.vizId;

    if (targetId === item1Id || targetId === item2Id) {
      const extractedRange = extractDatesFromFilterGroup(group, targetId);

      if (extractedRange !== null) {
        // Check if the range is complete (both startDate and endDate are defined strings)
        if (
          extractedRange.startDate !== undefined &&
          extractedRange.endDate !== undefined
        ) {
          collectedDateRanges.push({
            startDate: extractedRange.startDate,
            endDate: extractedRange.endDate,
          });
        } else {
          // Log if the range was extracted but is incomplete
          console.warn(
            `Incomplete date range extracted for item ${targetId} (some dates missing):`,
            extractedRange
          );
        }
      }
      // If extractedRange is null, extractDatesFromFilterGroup already logged it or it was not applicable.
    }
  });

  // Sort by startDate, ensuring startDate is valid (string) for comparison
  collectedDateRanges.sort((a, b) => {
    const aStartDate = a.startDate;
    const bStartDate = b.startDate;

    if (aStartDate && bStartDate) {
      // Both are non-empty strings
      return new Date(aStartDate).getTime() - new Date(bStartDate).getTime();
    }
    if (aStartDate) return -1; // a comes first if b has no startDate or it's empty
    if (bStartDate) return 1; // b comes first if a has no startDate or it's empty
    return 0; // both lack startDate or they are empty, order doesn't matter
  });

  return collectedDateRanges;
}

/**
 * Sets up event listeners for date filter components.
 * If exactly two date-filter items are found in a view, a 'changedFilters'
 * event listener is attached to both of them.
 * Also, listens for 'load' events on these items to get initial filters.
 * @param dashboardRow - The dashboard data.
 * @param dashboardElement - The main HTML element containing the dashboard grids.
 */
export function setupDateFilterListeners(
  dashboardRow: DashboardRow,
  dashboardElement: HTMLElement
) {
  if (!dashboardRow || !dashboardRow.contents || !dashboardRow.contents.views) {
    console.warn("Dashboard data is not available for setting up listeners.");
    return;
  }

  const viewLoadStates = new Map<number, ViewLoadState>();

  dashboardRow.contents.views.forEach(
    (view: DashboardView, viewIndex: number) => {
      const viewElement = dashboardElement.children[viewIndex] as HTMLElement;
      if (!viewElement) {
        console.warn(
          `View element for screenModus '${view.screenModus}' (index ${viewIndex}) not found in the dashboard element. Skipping listener setup for this view.`
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
            `One or both date filter items in view ${view.screenModus} are missing an ID. Skipping listener setup for this pair.`
          );
          return;
        }

        const currentItem1Id = item1Definition.id; // Capture IDs for use in closures
        const currentItem2Id = item2Definition.id;

        viewLoadStates.set(viewIndex, {
          item1Id: currentItem1Id,
          item2Id: currentItem2Id,
          item1Loaded: false,
          item2Loaded: false,
        });

        // Define event handlers as named functions
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
              `[ChangedFilters] Sorted Dates for view ${view.screenModus} (Item1: ${currentItem1Id}, Item2: ${currentItem2Id}):`,
              sortedDateRanges
            );
          } else {
            console.warn(
              "Could not process changedFilters: missing allDashboardFilters.",
              { allDashboardFilters }
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
            console.error(
              "View load state or item IDs are unexpectedly missing after load event."
            );
            return;
          }

          // These are already captured as currentItem1Id and currentItem2Id
          // const loadedItem1IdConst = currentViewState.item1Id;
          // const loadedItem2IdConst = currentViewState.item2Id;

          if (loadedItemId === currentViewState.item1Id) {
            currentViewState.item1Loaded = true;
            currentViewState.item1Ref = vizItemComponentRef;
          } else if (loadedItemId === currentViewState.item2Id) {
            currentViewState.item2Loaded = true;
            currentViewState.item2Ref = vizItemComponentRef;
          }

          if (currentViewState.item1Loaded && currentViewState.item2Loaded) {
            const componentToGetFiltersFrom = currentViewState.item1Ref;
            if (
              componentToGetFiltersFrom &&
              typeof componentToGetFiltersFrom.getFilters === "function"
            ) {
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
                  `[InitialLoad] Sorted Dates for view ${view.screenModus} (Item1: ${currentItem1Id}, Item2: ${currentItem2Id}):`,
                  sortedDateRanges
                );
              } catch (e) {
                console.error(
                  `Error calling getFilters on item ${currentItem1Id} in view ${view.screenModus}:`,
                  e
                );
              }
            } else {
              console.error(
                `getFilters method not found on item ${currentItem1Id} in view ${view.screenModus}.`
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
            // Pass item.id and vizItemComponent to the load handler
            vizItemComponent.addEventListener("load", () =>
              handleLoad(item.id!, vizItemComponent)
            );
          } else {
            console.warn(
              `Could not find 'luzmo-embed-viz-item' with itemId '${item.id}' in view ${view.screenModus}. Ensure items are rendered with this attribute within their respective view. Searched within:`,
              viewElement
            );
          }
        });
      }
    }
  );
}
