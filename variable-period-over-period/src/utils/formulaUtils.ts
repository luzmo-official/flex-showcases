import { embedToken } from "../config/config";
import type { DashboardRow, DashboardItem, ItemSlot } from "../types/dashboard";

export interface SecurableFormula {
  formula_id: string;
  securable_id: string;
}

export interface Formula {
  id: string;
  expression: string;
  securableFormula?: SecurableFormula;
}

export interface DatasetRow {
  id: string;
  name: Record<string, string>;
  formulas: Formula[];
  // Other properties like dashboards, columns can be added if needed
}

export interface DatasetFormulasResponse {
  count: number;
  rows: DatasetRow[];
}

export interface FormulaWithItems {
  formula: Formula;
  items: DashboardItem[];
}

const LUZMO_API_SECURABLE_URL = "https://api.luzmo.com/0.1.0/securable";

/**
 * Fetches all formulas for datasets linked to a given dashboard ID.
 * @param dashboardId The ID of the dashboard.
 * @returns A Promise that resolves to the API response containing formulas for linked datasets.
 * @throws An error if the API request fails.
 */
export async function fetchDatasetFormulas(
  dashboardId: string
): Promise<DatasetFormulasResponse> {
  if (!embedToken.authKey || !embedToken.authToken) {
    console.error(
      "Embed key or token is missing. Please check your environment variables."
    );
    throw new Error("Authentication details are missing.");
  }

  const requestBody = {
    action: "get",
    version: "0.1.0",
    key: embedToken.authKey,
    token: embedToken.authToken,
    find: {
      attributes: ["name", "id"],
      where: {
        type: "dataset",
      },
      include: [
        {
          attributes: ["id"],
          model: "Securable",
          as: "Dashboards",
          where: {
            id: dashboardId,
          },
          jointype: "inner",
        },
        {
          attributes: ["id", "expression"],
          model: "Formula",
          jointype: "inner",
        },
      ],
    },
  };

  try {
    const response = await fetch(LUZMO_API_SECURABLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", errorBody);
      throw new Error(
        `Failed to fetch dataset formulas: ${response.status} ${response.statusText}`
      );
    }
    return (await response.json()) as DatasetFormulasResponse;
  } catch (error) {
    console.error("Error fetching dataset formulas:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

/**
 * Fetches all formulas for datasets linked to a given dashboard ID and returns them as a flat array.
 * @param dashboardId The ID of the dashboard.
 * @returns A Promise that resolves to an array of Formula objects, or an empty array if none are found or in case of error.
 */
export async function getAllFormulasForDashboard(
  dashboardId: string
): Promise<Formula[]> {
  try {
    const formulasResponse = await fetchDatasetFormulas(dashboardId);
    const allFormulas: Formula[] = [];
    if (formulasResponse.rows && formulasResponse.rows.length > 0) {
      formulasResponse.rows.forEach((dataset) => {
        if (dataset.formulas && dataset.formulas.length > 0) {
          allFormulas.push(...dataset.formulas);
        }
      });
    }
    return allFormulas;
  } catch (error) {
    console.error(
      `Error fetching all formulas for dashboard ${dashboardId}:`,
      error
    );
    return []; // Return empty array in case of error to prevent downstream issues
  }
}

/**
 * Default keywords used for filtering period-over-period formulas.
 */
export const DEFAULT_POP_FORMULA_KEYWORDS = [
  "BASE_DATE_START",
  "BASE_DATE_END",
  "COMPARE_DATE_START",
  "COMPARE_DATE_END",
];

/**
 * Filters formulas based on keywords and whether they are used in dashboard slots.
 * @param formulas Array of formulas to filter
 * @param usedFormulaIds Set of formula IDs that are used in dashboard slots
 * @param keywords Array of keywords to filter formulas by (defaults to period-over-period keywords)
 * @returns Array of formulas that contain at least one keyword and are used in dashboard slots
 */
export function filterRelevantFormulas(
  formulas: Formula[],
  usedFormulaIds: Set<string>,
  keywords: string[] = DEFAULT_POP_FORMULA_KEYWORDS
): Formula[] {
  return formulas.filter((formula) => {
    const hasKeyword = keywords.some((keyword) =>
      formula.expression.includes(keyword)
    );
    const isUsed = usedFormulaIds.has(formula.id);
    return hasKeyword && isUsed;
  });
}

/**
 * Finds all items and their slots in a dashboard that contain specific formula IDs.
 * @param dashboardRow The dashboard data
 * @param formulaIds Set of formula IDs to find in items
 * @returns An array of DashboardItem objects that use the formula IDs, deduplicated by item.id
 */
export function findItemsWithFormulas(
  dashboardRow: DashboardRow,
  formulaIds: Set<string>
): DashboardItem[] {
  const itemsMap = new Map<string, DashboardItem>(); // Use a Map to store items by ID for deduplication

  if (!dashboardRow?.contents?.views) {
    return [];
  }

  // Iterate through all views, items, and slots
  dashboardRow.contents.views.forEach((view) => {
    if (!view?.items) return;

    view.items.forEach((item: DashboardItem) => {
      if (!item?.slots || !item.id) return;

      // Check if any of the item's slots use one of the formulaIds
      const hasRelevantFormula = item.slots.some((slot: ItemSlot) => {
        if (!slot?.content) return false;
        return slot.content.some((contentItem) => {
          return contentItem?.formula && formulaIds.has(contentItem.formula);
        });
      });

      // If this item has a relevant formula and it's not already added, add it to the map
      if (hasRelevantFormula && !itemsMap.has(item.id)) {
        itemsMap.set(item.id, item);
      }
    });
  });

  return Array.from(itemsMap.values()); // Convert the Map values to an array
}

/**
 * Gets all formulas from a dashboard that contain specific keywords and are used in slots,
 * along with information about which items use these formulas.
 *
 * @param dashboardId The ID of the dashboard
 * @param dashboardRow The dashboard data
 * @param usedFormulaIds Set of formula IDs used in dashboard slots
 * @param keywords Array of keywords to filter formulas by (defaults to period-over-period keywords)
 * @returns A Promise that resolves to an array of FormulaWithItems objects
 */
export async function getRelevantFormulasWithItems(
  dashboardId: string,
  dashboardRow: DashboardRow,
  usedFormulaIds: Set<string>,
  keywords: string[] = DEFAULT_POP_FORMULA_KEYWORDS
): Promise<FormulaWithItems[]> {
  try {
    // Get all formulas from the API for the dashboard
    const allFetchedFormulas = await getAllFormulasForDashboard(dashboardId);

    // Filter the formulas by keywords and usage
    const relevantFormulas = filterRelevantFormulas(
      allFetchedFormulas,
      usedFormulaIds,
      keywords
    );

    // Build a set of relevant formula IDs for quick lookup
    const relevantFormulaIds = new Set(
      relevantFormulas.map((formula) => formula.id)
    );

    // Find all items that contain these formula IDs (these items are already unique by ID due to findItemsWithFormulas logic)
    const itemsWithRelevantFormulas: DashboardItem[] = findItemsWithFormulas(
      dashboardRow,
      relevantFormulaIds
    );

    // Create a map for quick lookup of items by ID to ensure uniqueness when associating with formulas
    const uniqueItemsById = new Map<string, DashboardItem>();
    itemsWithRelevantFormulas.forEach((item) => {
      if (!uniqueItemsById.has(item.id)) {
        uniqueItemsById.set(item.id, item);
      }
    });

    // Merge formula information with item information
    return relevantFormulas.map((formula) => {
      const itemsForThisFormula = Array.from(uniqueItemsById.values()).filter(
        (item) => {
          // Check if this item contains this specific formula
          return item.slots.some((slot) =>
            slot.content?.some(
              (contentItem) => contentItem.formula === formula.id
            )
          );
        }
      );
      return {
        formula,
        items: itemsForThisFormula,
      };
    });
  } catch (error) {
    console.error(
      `Error getting relevant formulas with items for dashboard ${dashboardId}:`,
      error
    );
    return []; // Return empty array in case of error
  }
}

/**
 * Gets all formulas from a dashboard that contain specific keywords and are used in slots.
 * This is a convenience function that combines multiple steps into one.
 *
 * @param dashboardId The ID of the dashboard
 * @param usedFormulaIds Set of formula IDs used in dashboard slots
 * @param keywords Array of keywords to filter formulas by (defaults to period-over-period keywords)
 * @returns A Promise that resolves to filtered formulas that match the criteria
 */
export async function getRelevantFormulasForDashboard(
  dashboardId: string,
  usedFormulaIds: Set<string>,
  keywords: string[] = DEFAULT_POP_FORMULA_KEYWORDS
): Promise<Formula[]> {
  try {
    // Get all formulas from the API for the dashboard
    const allFetchedFormulas = await getAllFormulasForDashboard(dashboardId);

    // Filter the formulas by keywords and usage
    return filterRelevantFormulas(allFetchedFormulas, usedFormulaIds, keywords);
  } catch (error) {
    console.error(
      `Error getting relevant formulas for dashboard ${dashboardId}:`,
      error
    );
    return []; // Return empty array in case of error
  }
}
