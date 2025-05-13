import type {
  DashboardRow,
  DashboardView,
  DashboardItem as DashboardItemType,
} from "../types/dashboard";
import { createDashboardItemElement } from "./DashboardItem";
import "./DashboardGrid.css"; // Import component-specific styles

// Default values for grid layout if not provided by API
const DEFAULT_GRID_COLUMNS = 48;
const DEFAULT_ROW_GAP_PX = 16;
const DEFAULT_COLUMN_GAP_PX = 16;

/**
 * Creates the main HTML element that contains all dashboard views.
 * Each view is a separate grid representing a specific screen mode (e.g., mobile, desktop).
 * @param dashboardRow The raw dashboard data object.
 * @returns HTMLElement The main container element for all dashboard views.
 */
export function createDashboardGridElement(
  dashboardRow: DashboardRow
): HTMLElement {
  const mainContainer = document.createElement("div");
  mainContainer.classList.add("dashboard-views-container");

  const dashboardContents = dashboardRow.contents;
  const fixedView = dashboardContents.views.find(
    (v) => v.screenModus === "fixed"
  );

  // Render only the fixed-width view if "fixed" screenModus exists,
  // otherwise render responsive views (mobile, tablet, desktop, etc.)
  if (fixedView) {
    mainContainer.classList.add("fixed-layout-active");
    // Process only the fixed view
    const viewGridElement = document.createElement("div");
    viewGridElement.classList.add("dashboard-grid-view");
    viewGridElement.classList.add(`view-fixed`);

    const fixedWidth =
      typeof fixedView.options.width === "number" && fixedView.options.width > 0
        ? fixedView.options.width
        : 800;
    viewGridElement.style.width = `${fixedWidth}px`;
    viewGridElement.style.margin = "0 auto"; // Center the fixed-width view

    // Set view height based on API data, or auto if not specified
    const apiDimensions = dashboardRow.dimensions[fixedView.screenModus];
    const viewHeight = apiDimensions ? apiDimensions[1] : null;
    viewGridElement.style.minHeight = viewHeight ? `${viewHeight}px` : "auto";

    const totalGridColumnsForView =
      fixedView.options.columns || DEFAULT_GRID_COLUMNS;
    viewGridElement.style.gridTemplateColumns = `repeat(${totalGridColumnsForView}, 1fr)`;

    const rowHeight = fixedView.options.rowHeight || 16;
    const themeOptions = fixedView.options.theme;
    const rowGap = themeOptions.margins[0] || DEFAULT_ROW_GAP_PX;
    const initialColumnGap = themeOptions.margins[1] || DEFAULT_COLUMN_GAP_PX;

    viewGridElement.style.setProperty(
      "--initial-column-gap",
      `${initialColumnGap}px`
    );
    viewGridElement.style.setProperty(
      "--grid-columns-count",
      String(totalGridColumnsForView)
    );
    viewGridElement.style.rowGap = `${rowGap}px`;

    const gridAutoRows = Math.max(0, rowHeight - rowGap);
    viewGridElement.style.gridAutoRows = `${gridAutoRows}px`;
    viewGridElement.style.position = "relative";

    // Create a map of all items in this fixed view for consistent item data retrieval.
    // (More impactful in responsive mode with potentially partial item data per view).
    const allItemsMap = new Map<string, DashboardItemType>();
    fixedView.items.forEach((item) => {
      if (!allItemsMap.has(item.id)) {
        // Though for a single fixed view, this map is simpler
        allItemsMap.set(item.id, item);
      }
    });

    fixedView.items.forEach((itemInView) => {
      const itemMaster = allItemsMap.get(itemInView.id) || itemInView;
      const itemElement = createDashboardItemElement(
        itemMaster,
        dashboardRow.id,
        itemInView.position
      );
      viewGridElement.appendChild(itemElement);
    });
    mainContainer.appendChild(viewGridElement);
  } else {
    // Handle responsive views (mobile, tablet, desktop, largeScreen) when no fixed screenModus is specified
    // Add CSS classes to container based on available views in API data
    const availableModes = new Set(
      dashboardContents.views.map((v) => v.screenModus)
    );
    availableModes.forEach((mode) => {
      mainContainer.classList.add(`has-${mode}-view`);
    });

    // Map all unique items across views to ensure complete item data availability
    const allItemsMap = new Map<string, DashboardItemType>();
    dashboardContents.views.forEach((v) => {
      v.items.forEach((item) => {
        if (!allItemsMap.has(item.id)) {
          allItemsMap.set(item.id, item);
        }
      });
    });

    dashboardContents.views.forEach((view: DashboardView) => {
      const viewGridElement = document.createElement("div");
      viewGridElement.classList.add("dashboard-grid-view");
      viewGridElement.classList.add(`view-${view.screenModus}`);

      // Set view height based on API data, or auto if not specified
      const apiDimensions = dashboardRow.dimensions[view.screenModus];
      const viewHeight = apiDimensions ? apiDimensions[1] : null;
      viewGridElement.style.minHeight = viewHeight ? `${viewHeight}px` : "auto";

      const totalGridColumnsForView =
        view.options.columns || DEFAULT_GRID_COLUMNS;
      viewGridElement.style.gridTemplateColumns = `repeat(${totalGridColumnsForView}, 1fr)`;

      const rowHeight = view.options.rowHeight || 16;
      const themeOptions = view.options.theme;
      const rowGap = themeOptions.margins[0] || DEFAULT_ROW_GAP_PX;
      const initialColumnGap = themeOptions.margins[1] || DEFAULT_COLUMN_GAP_PX;

      // Set CSS Custom Properties. These are used by DashboardGrid.css to calculate
      // the final column-gap, ensuring it doesn't exceed the available space within the view.
      viewGridElement.style.setProperty(
        "--initial-column-gap",
        `${initialColumnGap}px`
      );
      viewGridElement.style.setProperty(
        "--grid-columns-count",
        String(totalGridColumnsForView)
      );
      viewGridElement.style.rowGap = `${rowGap}px`;

      const gridAutoRows = Math.max(0, rowHeight - rowGap);
      viewGridElement.style.gridAutoRows = `${gridAutoRows}px`;
      viewGridElement.style.position = "relative";
      viewGridElement.style.margin = "0 auto"; // Center responsive views within the main container.

      view.items.forEach((itemInView) => {
        const itemMaster = allItemsMap.get(itemInView.id) || itemInView;
        const itemElement = createDashboardItemElement(
          itemMaster,
          dashboardRow.id,
          itemInView.position
        );
        viewGridElement.appendChild(itemElement);
      });
      mainContainer.appendChild(viewGridElement);
    });
  }

  return mainContainer;
}
