import { ItemType } from "@luzmo/ngx-embed";
import { Slot } from "@luzmo/dashboard-contents-types";

export type Chart = {
  type: ItemType,
  name: string;
  icon: string;
  fixedOptions?: any;
  settings: any;
  slots: Slot[];
  filters?: any[];
}
