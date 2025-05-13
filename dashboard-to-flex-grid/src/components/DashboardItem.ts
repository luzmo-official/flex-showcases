import type {
  DashboardItem as DashboardItemType,
  ItemPosition,
} from "../types/dashboard";
import { embedToken } from "../config/config";
import "@luzmo/embed"; // Import the Luzmo custom element
import "./DashboardItem.css"; // Import component-specific styles

/**
 * Creates an HTML element for a single dashboard item and configures its grid positioning and content.
 *
 * @param item The dashboard item data.
 * @param dashboardId The ID of the dashboard this item belongs to.
 * @param itemPosition Positional information (column, row, size) for CSS grid.
 * @returns HTMLElement The configured dashboard item element.
 */
export function createDashboardItemElement(
  item: DashboardItemType,
  dashboardId: string,
  itemPosition: ItemPosition
): HTMLElement {
  const itemElement = document.createElement("div");
  itemElement.classList.add("dashboard-item");

  // Apply CSS Grid positioning styles based on the item's position data
  itemElement.style.gridColumnStart = `${itemPosition.col + 1}`;
  itemElement.style.gridColumnEnd = `span ${itemPosition.sizeX}`;
  itemElement.style.gridRowStart = `${itemPosition.row + 1}`;
  itemElement.style.gridRowEnd = `span ${itemPosition.sizeY}`;

  // Create the Luzmo custom element to embed the visualization
  const luzmoItem = document.createElement("luzmo-embed-viz-item");

  // Set necessary attributes for the Luzmo custom element
  luzmoItem.setAttribute("authKey", embedToken.authKey || "");
  luzmoItem.setAttribute("authToken", embedToken.authToken || "");
  luzmoItem.setAttribute("type", item.type);
  luzmoItem.setAttribute("dashboardId", dashboardId);
  luzmoItem.setAttribute("itemId", item.id);

  // Ensure the Luzmo element fills the padded area of its parent
  luzmoItem.style.width = "100%";
  luzmoItem.style.height = "100%";
  luzmoItem.style.display = "block"; // Custom elements often default to inline

  // Stringify and set options and slots attributes, with error handling
  try {
    luzmoItem.setAttribute("options", JSON.stringify(item.options));
  } catch (e) {
    console.error("Failed to stringify item options for item ID:", item.id, e);
    luzmoItem.setAttribute("options", "{}"); // Fallback to an empty object
  }

  try {
    luzmoItem.setAttribute("slots", JSON.stringify(item.slots));
  } catch (e) {
    console.error("Failed to stringify item slots for item ID:", item.id, e);
    luzmoItem.setAttribute("slots", "[]"); // Fallback to an empty array
  }

  itemElement.appendChild(luzmoItem);

  return itemElement;
}
