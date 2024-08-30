import { ItemType } from "@luzmo/ngx-embed";

export interface AIChart {
  functionCall: string;
  functionResponse: unknown;
  generatedChart: {
    aichartId: string;
    content: any;
    options: any;
    position: any;
    slots: any;
    title: any;
    type: ItemType;
  };
  question: string;
}
