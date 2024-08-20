export type LocalizedString = {
  [key: string]: string;
};

export interface AuthorizationToken {
  key: string;
  token: string;
}

export interface WidgetProps {
  appServer?: string | "https://app.luzmo.com";
  apiHost?: string | "https://api.luzmo.com";
  authorization?: AuthorizationToken | undefined;
  dashboardId?: string | undefined;
  itemId?: string | undefined;
  widgetTitle?: LocalizedString | undefined;
}

export type NumericAggregation =
  | "sum"
  | "average"
  | "min"
  | "max"
  | "count"
  | "distinctcount";

export type NonNumericAggregation = "count" | "distinctcount";
