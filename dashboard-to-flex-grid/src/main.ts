import "./global.css";
import { fetchDashboardRow } from "./utils/fetch-dashboard";
import { dashboards } from "./config/config";
import { createDashboardGridElement } from "./components/DashboardGrid";
import type { DashboardRow } from "./types/dashboard";

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

    console.log("Original Dashboard Row:", originalDashboardRow);

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
