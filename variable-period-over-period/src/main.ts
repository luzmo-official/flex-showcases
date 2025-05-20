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
  getRelevantFormulasWithItems, // Updated import
} from "./utils/formulaUtils";
import type { FormulaWithItems } from "./utils/formulaUtils";
import { extractUsedFormulaIdsFromDashboard } from "./utils/dashboardUtils"; // New import

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

/**
 * Initializes the dashboard: fetches data and renders the grid.
 */
async function initializeDashboard() {
  try {
    const dashboardId = dashboards.main;

    const originalDashboardRow: DashboardRow = await fetchDashboardRow(
      dashboardId
    );

    // Step 1: Extract formula IDs used in dashboard slots
    const usedFormulaIdsInSlots =
      extractUsedFormulaIdsFromDashboard(originalDashboardRow);
    console.log("Formula IDs used in dashboard slots:", usedFormulaIdsInSlots);

    // Step 2: Get relevant formulas that contain keywords and are used in dashboard slots
    const relevantFormulasWithItems: FormulaWithItems[] =
      await getRelevantFormulasWithItems(
        dashboardId,
        originalDashboardRow,
        usedFormulaIdsInSlots
      );

    console.log(
      "Relevant formulas with their items and slots:",
      relevantFormulasWithItems
    );

    // Log item IDs that use relevant formulas, for easier reference
    const itemIdsWithRelevantFormulas = new Set<string>();
    relevantFormulasWithItems.forEach(({ items }) => {
      items.forEach((item) => itemIdsWithRelevantFormulas.add(item.id));
    });
    console.log("Item IDs using relevant formulas:", [
      ...itemIdsWithRelevantFormulas,
    ]);

    // Use originalDashboardRow directly if no processing needed
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

      // Setup event listeners after the dashboard is rendered
      setupDateFilterListeners(originalDashboardRow, dashboardGridElement);
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
