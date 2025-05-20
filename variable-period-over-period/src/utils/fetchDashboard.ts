import { embedToken } from "../config/config";
import type { DashboardApiResponse, DashboardRow } from "../types/dashboard";

// Define the URL
const url = "https://api.luzmo.com/0.1.0/securable";

// Add error type
export class DashboardFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardFetchError";
  }
}

// Function to fetch data and parse items
export async function fetchDashboardRow(
  dashboardId: string
): Promise<DashboardRow> {
  if (!dashboardId) {
    throw new DashboardFetchError("Dashboard ID is required");
  }

  const payload = {
    action: "get",
    key: embedToken.authKey,
    token: embedToken.authToken,
    version: "0.1.0",
    find: {
      where: {
        id: dashboardId,
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new DashboardFetchError(`HTTP error! status: ${response.status}`);
    }

    const data: DashboardApiResponse = await response.json();

    if (!data.rows?.[0]) {
      throw new DashboardFetchError(
        "Invalid dashboard data structure: missing rows[0]"
      );
    }

    return data.rows[0];
  } catch (error) {
    if (error instanceof DashboardFetchError) {
      throw error;
    }
    console.error("Error fetching dashboard row:", error);
    throw new DashboardFetchError("Failed to fetch dashboard row");
  }
}
