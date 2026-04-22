import { VizItemType } from "@luzmo/ngx-embed";
import { Slot } from "@luzmo/dashboard-contents-types";

export type Chart = {
  type: VizItemType,
  name: string;
  icon: string;
  fixedOptions?: any;
  settings: any;
  slots: Slot[];
  filters?: any[];
}
