import { ItemType } from "@luzmo/ngx-embed";
import { Slot } from "src/app/shared/models/slots";

export type Chart = {
  type: ItemType,
  name: string;
  icon: string;
  fixedOptions?: any;
  settings: any;
  slots: Slot[];
  filters?: any[];
}
