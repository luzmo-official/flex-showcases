import type { VizItemType, VizItemSlot, VizItemOptions, ItemFilterGroup } from "@luzmo/ngx-embed";

export type Chart = {
  type: VizItemType,
  name: string;
  icon: string;
  options: VizItemOptions;
  slots: VizItemSlot[];
  filters?: ItemFilterGroup[];
}
