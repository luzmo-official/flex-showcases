export interface DataItem {
  id: string;
  name: Record<string, string>;
  type: "hierarchy" | "datetime" | "numeric";
  format?: string;
  lowestLevel?: number;
  subtype?: string;
  currency?: string;
  aggregationFunc?: string;
}

export interface DatasetDataFields {
  id: string;
  name: Record<string, string>;
  columns: DataItem[];
  formulas: unknown[];
}

export const DATASET_ID = "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f";

export const AVAILABLE_DATA: DataItem[] = [
  {
    id: "8a6ec2d5-977d-48c5-ada4-b69ffd968f9c",
    name: { en: "Brand" },
    type: "hierarchy",
  },
  {
    id: "55389304-a1b1-443a-b461-4a68e14df161",
    name: { en: "Card type" },
    type: "hierarchy",
  },
  {
    id: "e8f1a8e2-b9bb-46d3-bf34-d0adeb116ef6",
    name: { en: "Purchase id" },
    type: "hierarchy",
  },
  {
    format: "%d-%m-%Y %H:%M:%S.%L",
    id: "a5e03c38-3095-4ed8-9a27-9a9109f611f9",
    lowestLevel: 9,
    name: { en: "Purchase date" },
    type: "datetime",
  },
  {
    format: ".0f",
    id: "8e4d004e-8c16-44e2-995f-f5b797354efe",
    name: { en: "Purchase value" },
    type: "numeric",
  },
  {
    id: "f44abf72-dfb4-4ed7-a5a2-6eb8cfc4aede",
    name: { en: "Purchase location" },
    type: "hierarchy",
  },
  {
    id: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
    name: { en: "Product type" },
    type: "hierarchy",
  },
];

export const DATASETS_DATA_FIELDS: DatasetDataFields[] = [
  {
    columns: AVAILABLE_DATA,
    formulas: [],
    id: DATASET_ID,
    name: { en: "Retail Purchases" },
  },
];

/**
 * Get a column by its English name with proper error handling
 */
const getColumnByName = (name: string): DataItem => {
  const column = AVAILABLE_DATA.find((d) => d.name.en === name);
  if (!column) {
    throw new Error(
      `Column "${name}" not found in AVAILABLE_DATA. Available columns: ${AVAILABLE_DATA.map((d) => d.name.en).join(", ")}`
    );
  }
  return column;
};

// Helper to get column by name for easy access in blocks-data
export const columns = {
  brand: getColumnByName("Brand"),
  cardType: getColumnByName("Card type"),
  productType: getColumnByName("Product type"),
  purchaseDate: getColumnByName("Purchase date"),
  purchaseId: getColumnByName("Purchase id"),
  purchaseLocation: getColumnByName("Purchase location"),
  purchaseValue: getColumnByName("Purchase value"),
} as const;
