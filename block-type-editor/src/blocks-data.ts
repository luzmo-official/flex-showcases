import { DATASET_ID, columns } from "./data";

export const blocks = [
  {
    data: {
      level: 2,
      text: "Overall Sales Performance",
    },
    type: "header",
  },
  {
    data: {
      text: "This month's purchase data reveals strong performance across all major brands. Total revenue and transaction volume continue to trend upward, driven by growth in key product categories and consistent spending across payment methods. The metrics below provide a snapshot of month-to-date and year-to-date performance.",
      title: "Summary",
      type: "info",
    },
    type: "callout",
  },
  {
    data: {
      columns: 2,
      content: [
        {
          options: {
            evolutionGraphDisplay: "none",
            numberFontSize: 32,
            titleFontSize: 16,
          },
          rawFilters: [
            {
              condition: "and",
              filters: [
                {
                  expression: "last_available",
                  parameters: [
                    {
                      columnId: columns.purchaseDate.id,
                      datasetId: DATASET_ID,
                    },
                    { quantity: 1, unit: 3 },
                  ],
                },
              ],
              subGroups: [],
            },
          ],
          slots: [
            {
              content: [
                {
                  aggregationFunc: "sum",
                  columnId: columns.purchaseValue.id,
                  datasetId: DATASET_ID,
                  format: ".0f",
                  label: { en: "Revenue MTD" },
                  type: "numeric",
                },
              ],
              name: "measure",
            },
            {
              content: [
                {
                  columnId: columns.purchaseDate.id,
                  datasetId: DATASET_ID,
                  duration: 1,
                  durationLevel: 3,
                  level: 3,
                  origin: "relative",
                  subtype: "datetime",
                },
              ],
              name: "filters",
            },
          ],
          type: "evolution-number",
        },
        {
          options: {
            evolutionGraphDisplay: "none",
            numberFontSize: 32,
            titleFontSize: 16,
          },
          rawFilters: [
            {
              condition: "and",
              filters: [
                {
                  expression: "last_available",
                  parameters: [
                    {
                      columnId: columns.purchaseDate.id,
                      datasetId: DATASET_ID,
                    },
                    { quantity: 1, unit: 1 },
                  ],
                },
              ],
              subGroups: [],
            },
          ],
          slots: [
            {
              content: [
                {
                  aggregationFunc: "sum",
                  columnId: columns.purchaseValue.id,
                  datasetId: DATASET_ID,
                  format: ".0f",
                  label: { en: "Revenue YTD" },
                  type: "numeric",
                },
              ],
              name: "measure",
            },
            {
              content: [
                {
                  columnId: columns.purchaseDate.id,
                  datasetId: DATASET_ID,
                  duration: 1,
                  durationLevel: 1,
                  level: 1,
                  origin: "relative",
                  subtype: "datetime",
                },
              ],
              name: "filters",
            },
          ],
          type: "evolution-number",
        },
        {
          options: {
            evolutionGraphDisplay: "none",
            numberFontSize: 32,
            titleFontSize: 16,
          },
          rawFilters: [
            {
              condition: "and",
              filters: [
                {
                  expression: "last_available",
                  parameters: [
                    {
                      columnId: columns.purchaseDate.id,
                      datasetId: DATASET_ID,
                    },
                    { quantity: 1, unit: 3 },
                  ],
                },
              ],
              subGroups: [],
            },
          ],
          slots: [
            {
              content: [
                {
                  aggregationFunc: "count",
                  columnId: columns.purchaseId.id,
                  datasetId: DATASET_ID,
                  format: ".0f",
                  label: { en: "Transactions MTD" },
                  type: "numeric",
                },
              ],
              name: "measure",
            },
            {
              content: [
                {
                  columnId: columns.purchaseDate.id,
                  datasetId: DATASET_ID,
                  duration: 1,
                  durationLevel: 3,
                  level: 3,
                  origin: "relative",
                  subtype: "datetime",
                },
              ],
              name: "filters",
            },
          ],
          type: "evolution-number",
        },
        {
          options: {
            evolutionGraphDisplay: "none",
            numberFontSize: 32,
            titleFontSize: 16,
          },
          rawFilters: [
            {
              condition: "and",
              filters: [
                {
                  expression: "last_available",
                  parameters: [
                    {
                      columnId: columns.purchaseDate.id,
                      datasetId: DATASET_ID,
                    },
                    { quantity: 1, unit: 1 },
                  ],
                },
              ],
              subGroups: [],
            },
          ],
          slots: [
            {
              content: [
                {
                  aggregationFunc: "count",
                  columnId: columns.purchaseId.id,
                  datasetId: DATASET_ID,
                  format: ".0f",
                  label: { en: "Transactions YTD" },
                  type: "numeric",
                },
              ],
              name: "measure",
            },
            {
              content: [
                {
                  columnId: columns.purchaseDate.id,
                  datasetId: DATASET_ID,
                  duration: 1,
                  durationLevel: 1,
                  level: 1,
                  origin: "relative",
                  subtype: "datetime",
                },
              ],
              name: "filters",
            },
          ],
          type: "evolution-number",
        },
      ],
      rows: 2,
    },
    type: "luzmoKeyMetrics",
  },
  {
    data: {
      level: 2,
      text: "Revenue Trend",
    },
    type: "header",
  },
  {
    data: {
      filters: [],
      options: {
        display: { title: false },
        mode: "grouped",
      },
      slots: [
        {
          content: [
            {
              aggregationFunc: "sum",
              columnId: columns.purchaseValue.id,
              datasetId: DATASET_ID,
              format: ".0f",
              label: { en: "Total Revenue" },
              type: "numeric",
            },
          ],
          name: "measure",
        },
        {
          content: [
            {
              columnId: columns.purchaseDate.id,
              datasetId: DATASET_ID,
              label: { en: "Month" },
              level: 3,
              subtype: "datetime",
            },
          ],
          name: "x-axis",
        },
      ],
      type: "area-chart",
    },
    type: "luzmoVizItem",
  },
  {
    data: {
      text: "Monthly revenue has followed a steady upward trend, with noticeable peaks that correlate with seasonal shopping periods. This highlights the cumulative effect of consistent transaction growth across all purchase locations.",
    },
    type: "paragraph",
  },
  {
    data: {
      level: 2,
      text: "Revenue by Brand",
    },
    type: "header",
  },
  {
    data: {
      filters: [],
      options: {
        display: {
          title: false,
        },
      },
      rawFilters: null,
      slots: [
        {
          content: [
            {
              aggregationFunc: "sum",
              columnId: columns.purchaseValue.id,
              datasetId: DATASET_ID,
              format: ".0f",
              label: {
                en: "Total Revenue",
              },
              type: "numeric",
            },
          ],
          name: "measure",
        },
        {
          content: [
            {
              columnId: columns.brand.id,
              datasetId: DATASET_ID,
              label: {
                en: "Brand",
              },
              type: "hierarchy",
            },
          ],
          name: "y-axis",
        },
      ],
      type: "bar-chart",
    },
    type: "luzmoVizItem",
  },
  {
    data: {
      filters: [],
      options: {
        display: { title: false },
      },
      slots: [
        {
          content: [
            {
              aggregationFunc: "sum",
              columnId: columns.purchaseValue.id,
              datasetId: DATASET_ID,
              format: ".0f",
              label: { en: "Total Revenue" },
              type: "numeric",
            },
          ],
          name: "measure",
        },
        {
          content: [
            {
              columnId: columns.productType.id,
              datasetId: DATASET_ID,
              label: { en: "Product Type" },
              level: 0,
              type: "hierarchy",
            },
          ],
          name: "category",
        },
      ],
      type: "donut-chart",
    },
    type: "luzmoVizItem",
  },
  {
    data: {
      level: 2,
      text: "Revenue by Payment Method",
    },
    type: "header",
  },
  {
    data: {
      filters: [],
      options: {
        display: { title: false },
      },
      slots: [
        {
          content: [
            {
              columnId: columns.brand.id,
              datasetId: DATASET_ID,
              label: { en: "Brand" },
              type: "hierarchy",
            },
            {
              columnId: columns.cardType.id,
              datasetId: DATASET_ID,
              label: { en: "Card Type" },
              level: 0,
              type: "hierarchy",
            },
            {
              aggregationFunc: "sum",
              columnId: columns.purchaseValue.id,
              datasetId: DATASET_ID,
              format: ".0f",
              label: { en: "Total Revenue" },
              type: "numeric",
            },
          ],
          name: "columns",
        },
      ],
      type: "regular-table",
    },
    type: "luzmoVizItem",
  },
  {
    data: {
      level: 2,
      text: "Key Insights & Recommendations",
    },
    type: "header",
  },
  {
    data: {
      items: [
        "<b>Brand Performance:</b> The top-performing brands account for the majority of total revenue. Consider expanding inventory and promotional efforts for these brands.",
        "<b>Product Mix:</b> Revenue is unevenly distributed across product types. Underrepresented categories may present growth opportunities with targeted promotions.",
        "<b>Payment Methods:</b> Revenue is distributed across multiple card types. Ensuring frictionless checkout for all major payment methods remains important.",
        "<b>Location Trends:</b> Regional purchase data can reveal valuable local insights — consider location-specific campaigns for underperforming areas.",
      ],
      style: "unordered",
    },
    type: "list",
  },
  {
    data: {
      text: "Based on these findings, we recommend:<br><br>1. Prioritize stock replenishment for top-grossing brands ahead of peak periods<br>2. Run targeted promotions for lower-performing product types to balance the revenue mix<br>3. Investigate regional purchase patterns to identify high-potential locations<br>4. Monitor card type trends to optimize payment partnerships and incentive programs",
      title: "Recommendations",
      type: "primary",
    },
    type: "callout",
  },
];
