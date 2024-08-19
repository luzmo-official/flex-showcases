import { ItemType } from "@luzmo/ngx-embed";
import { ColumnType } from "src/app/shared/models/colum.model";

export type Slot = {
  acceptsMultiple: boolean;
  content: {
    label: Record<string, string>;
    set: string;
    column: string;
    type: ColumnType;
    subtype: string;
    format: string;
  }[];
  formattedName: string;
  name: 'y-axis' | 'measure' | 'legend' | 'x-axis' | 'evolution' | 'row' | 'column' | 'columns' | 'category' | 'target' | 'color' | 'geo' | 'route' | 'order' | 'source' | 'destination' | 'size' | 'name' | 'levels' | 'open' | 'high' | 'low' | 'close' | 'coordinates' | 'identifier';
  type: string;
}

export type Chart = {
  type: ItemType,
  name: string;
  icon: string;
  fixedOptions?: any;
  settings: any;
  slots: Slot[];
  filters?: any[];
}