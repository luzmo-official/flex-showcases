import type {
  DashboardRow,
  DashboardView,
  DashboardItem,
  ItemSlot,
  SlotContentItem,
} from "../types/dashboard";

/**
 * Extracts all unique formula IDs used within the slots of all items across all views in a dashboard.
 * @param dashboardRow The dashboard data.
 * @returns A Set of unique formula IDs found in the dashboard's slots.
 */
export function extractUsedFormulaIdsFromDashboard(
  dashboardRow: DashboardRow
): Set<string> {
  const usedFormulaIds = new Set<string>();

  if (!dashboardRow?.contents?.views) {
    console.warn(
      "Dashboard data or views missing, cannot extract formula IDs."
    );
    return usedFormulaIds;
  }

  dashboardRow.contents.views.forEach((view: DashboardView) => {
    if (!view?.items) return;
    view.items.forEach((item: DashboardItem) => {
      if (!item?.slots) return;
      item.slots.forEach((slot: ItemSlot) => {
        if (!slot?.content) return;
        slot.content.forEach((contentItem: SlotContentItem) => {
          if (contentItem?.formula) {
            usedFormulaIds.add(contentItem.formula);
          }
        });
      });
    });
  });

  return usedFormulaIds;
}
