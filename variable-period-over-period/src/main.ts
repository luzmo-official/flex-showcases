import "./global.css";
import { fetchDashboardRow } from "./utils/fetchDashboard";
import { dashboards } from "./config/config";
import { createDashboardGridElement } from "./components/DashboardGrid";
import type {
  DashboardRow,
  // DashboardView, // Already imported in eventListeners.ts if needed there
  // DashboardItem, // Already imported in eventListeners.ts if needed there
} from "./types/dashboard";
import { setupDateFilterListeners } from "./utils/eventListeners";
import {
  getRelevantFormulasWithItems,
  groupRelevantFormulasByItem,
} from "./utils/formulaUtils";
import type {
  FormulaWithItems,
  ItemWithRelevantFormulas,
} from "./utils/formulaUtils";
import { extractUsedFormulaIdsFromDashboard } from "./utils/dashboardUtils";

const appElement = document.querySelector<HTMLDivElement>("#app")!;

// Initial HTML structure for the application
appElement.innerHTML = `
  <div class="app-container">
    <h1>Flex Grid Dashboard</h1>
    <div class="app-description">
      This page displays a responsive dashboard that can be edited through Luzmo's Studio, but is embedded as indivudal Flex components in a pure CSS grid. 
      It fetches dashboard data from an API and renders Flex visualization items in a grid layout.
    </div>
    <div id="dashboard-content">
      <p>Loading dashboard...</p>
    </div>
  </div>
`;

const dashboardContentElement =
  document.querySelector<HTMLDivElement>("#dashboard-content")!;

// Store data that needs to be accessed by event listeners
let initialDashboardRow: DashboardRow | null = null;
let initialItemsWithRelevantFormulas: ItemWithRelevantFormulas[] = [];

/**
 * Initializes the dashboard: fetches data and renders the grid.
 */
async function initializeDashboard() {
  try {
    const dashboardId = dashboards.main;

    const originalDashboardRow: DashboardRow = await fetchDashboardRow(
      dashboardId
    );
    initialDashboardRow = originalDashboardRow; // Store for event listeners

    // Step 1: Extract formula IDs used in dashboard slots
    const usedFormulaIdsInSlots =
      extractUsedFormulaIdsFromDashboard(originalDashboardRow);
    console.log("Formula IDs used in dashboard slots:", usedFormulaIdsInSlots);

    // Step 2: Get relevant formulas that contain keywords and are used in dashboard slots, grouped by formula
    const relevantFormulasWithItems: FormulaWithItems[] =
      await getRelevantFormulasWithItems(
        dashboardId,
        originalDashboardRow,
        usedFormulaIdsInSlots
      );

    console.log(
      "Relevant formulas with their items and slots (Grouped by Formula):",
      relevantFormulasWithItems
    );

    // Step 3: Restructure the data to be grouped by item
    const itemsWithRelevantFormulas: ItemWithRelevantFormulas[] =
      groupRelevantFormulasByItem(relevantFormulasWithItems);
    initialItemsWithRelevantFormulas = itemsWithRelevantFormulas; // Store for event listeners

    console.log(
      "Relevant items with their formulas (Grouped by Item):",
      itemsWithRelevantFormulas
    );

    // Log item IDs that use relevant formulas, for easier reference (using the new structure)
    const itemIdsWithRelevantFormulasSet = new Set<string>();
    itemsWithRelevantFormulas.forEach(({ item }) => {
      itemIdsWithRelevantFormulasSet.add(item.id);
    });
    console.log("Item IDs using relevant formulas (from item-grouped data):", [
      ...itemIdsWithRelevantFormulasSet,
    ]);

    const dashboardGridElement =
      createDashboardGridElement(originalDashboardRow);

    // Render dashboard grid if data is valid
    if (
      originalDashboardRow &&
      originalDashboardRow.contents &&
      originalDashboardRow.contents.views
    ) {
      dashboardContentElement.innerHTML = ""; // Clear loading message
      dashboardContentElement.appendChild(dashboardGridElement);

      // Pass the stored data to the event listener setup
      if (initialDashboardRow && initialItemsWithRelevantFormulas.length > 0) {
        setupDateFilterListeners(
          initialDashboardRow,
          dashboardGridElement,
          initialItemsWithRelevantFormulas
        );
      } else {
        console.warn(
          "Dashboard data or relevant items not available for setting up date filter listeners."
        );
      }
    } else {
      throw new Error("Dashboard data is not in the expected format.");
    }
  } catch (error) {
    console.error("Failed to initialize dashboard:", error);
    // Display error message to the user
    dashboardContentElement.innerHTML = `
      <p style="color: red;">Failed to initialize dashboard. Error: ${
        error instanceof Error ? error.message : String(error)
      }</p>
    `;
  }
}

initializeDashboard();
