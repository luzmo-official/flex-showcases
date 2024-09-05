import resizeHandles from "./ResizeHandles";

const flexConfig = {
  chartList: [
    {
      title: "Total Sales Volume",
      type: "evolution-number",
      layout: { x: 0, y: 0, w: 4, h: 4, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Total Sales",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
          ],
        },
      ],
    },
    {
      title: "Total Sales - Inner Planets",
      type: "evolution-number",
      layout: { x: 0, y: 0, w: 4, h: 4, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Total Sales - Inner Planets",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
          ],
        },
      ],
      filters: [
        {
          condition: "or",
          filters: [
            {
              expression: "? in ?",
              parameters: [
                {
                  column_id: "f44abf72-dfb4-4ed7-a5a2-6eb8cfc4aede",
                  dataset_id: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
                  level: 1,
                },
                ["Mercury", "Venus", "Earth", "Moon", "Mars"],
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Total Sales - Outer Planets",
      type: "evolution-number",
      layout: { x: 0, y: 0, w: 4, h: 4, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Total Sales - Outer Planets",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
          ],
        },
      ],
      filters: [
        {
          condition: "or",
          filters: [
            {
              expression: "? not in ?",
              parameters: [
                {
                  column_id: "f44abf72-dfb4-4ed7-a5a2-6eb8cfc4aede",
                  dataset_id: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
                  level: 1,
                },
                ["Mercury", "Venus", "Earth", "Moon", "Mars"],
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Bar Chart - Sales by Product & Location",
      type: "bar-chart",
      layout: { x: 0, y: 0, w: 6, h: 6, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        mode: "grouped",
        bars: {
          label: "percentage",
          roundedCorners: 5,
        },
        legend: { position: "bottom" },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Sales",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
          ],
        },
        {
          name: "y-axis",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
              type: "hierarchy",
            },
          ],
        },
        {
          name: "legend",
          content: [
            {
              label: {
                en: "Location",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "f44abf72-dfb4-4ed7-a5a2-6eb8cfc4aede",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
    {
      title: "Line Chart - Sales Volume by Product & Location",
      type: "line-chart",
      layout: { x: 0, y: 0, w: 6, h: 6, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        legend: { position: "bottom" },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Volume",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
          ],
        },
        {
          name: "x-axis",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
              type: "hierarchy",
            },
          ],
        },
        {
          name: "legend",
          content: [
            {
              label: {
                en: "Location",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "f44abf72-dfb4-4ed7-a5a2-6eb8cfc4aede",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
    {
      title: "Donut - Sales Volume by Product",
      type: "donut-chart",
      layout: { x: 0, y: 0, w: 4, h: 4, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        legend: { position: "bottom" },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Volume",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              format: ".3s",
            },
          ],
        },
        {
          name: "category",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
    {
      title: "Bubble Chart - Sales Volume by Product & Location",
      type: "bubble-chart",
      layout: { x: 0, y: 0, w: 6, h: 6, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        title: { en: "Sales by Product & Location" },
        legend: { position: "bottom" },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Volume",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
          ],
        },
        {
          name: "category",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
              type: "hierarchy",
            },
          ],
        },
        {
          name: "color",
          content: [
            {
              label: {
                en: "Location",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "f44abf72-dfb4-4ed7-a5a2-6eb8cfc4aede",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
    {
      title: "Bullet - Sales Volume by Product",
      type: "bullet-chart",
      layout: { x: 0, y: 0, w: 6, h: 4, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        sort: {
          aggregation: {
            type: "sum",
          },
          by: "measure",
          direction: "desc",
        },
      },
      slots: [
        {
          name: "measure",
          content: [
            {
              label: {
                en: "Volume",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
          ],
        },
        {
          name: "category",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
    {
      title: "Table - Product, Volume & Location",
      type: "regular-table",
      layout: { x: 0, y: 0, w: 12, h: 6, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
      },
      slots: [
        {
          name: "columns",
          content: [
            {
              label: {
                en: "Date",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "a5e03c38-3095-4ed8-9a27-9a9109f611f9",
              type: "datetime",
              level: 5,
            },
            {
              label: {
                en: "Brand",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8a6ec2d5-977d-48c5-ada4-b69ffd968f9c",
              type: "hierarchy",
            },
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
              type: "hierarchy",
            },
            {
              label: {
                en: "Value",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8e4d004e-8c16-44e2-995f-f5b797354efe",
              type: "numeric",
              subtype: "currency",
              currency: "$",
              format: ".3s",
            },
            {
              label: {
                en: "Location",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "f44abf72-dfb4-4ed7-a5a2-6eb8cfc4aede",
              type: "hierarchy",
            },
            {
              label: {
                en: "Card Type",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "55389304-a1b1-443a-b461-4a68e14df161",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
  ],
  filterList: [
    {
      title: "Date Filter",
      type: "date-filter",
      layout: { x: 0, y: 0, w: 4, h: 3, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        mode: "grouped",
        bars: {
          label: "percentage",
          roundedCorners: 5,
        },
      },
      slots: [
        {
          name: "time",
          content: [
            {
              label: {
                en: "Date",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "a5e03c38-3095-4ed8-9a27-9a9109f611f9",
              type: "datetime",
              format: "%d-%m-%Y %H:%M:%S.%L",
              lowestLevel: 9,
              level: 7,
            },
          ],
        },
      ],
    },
    {
      title: "Brand Filter",
      type: "dropdown-filter",
      layout: { x: 0, y: 0, w: 4, h: 3, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        placeholder: { en: "Select Brand" },
      },
      slots: [
        {
          name: "dimension",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "8a6ec2d5-977d-48c5-ada4-b69ffd968f9c",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
    {
      title: "Product Filter",
      type: "slicer-filter",
      layout: { x: 0, y: 0, w: 4, h: 3, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        rankbar: {
          padding: 2,
          position: "background",
          radius: 20,
        },
        rank: true,
        layout: {
          alignment: "vertical",
        },
        sort: {
          aggregation: {
            type: "sum",
          },
          by: "measure",
          direction: "desc",
        },
      },
      slots: [
        {
          name: "dimension",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "0f9b5cb0-0354-4147-b73c-463d26da8c75",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
    {
      title: "Card Type Filter",
      type: "slicer-filter",
      layout: { x: 0, y: 0, w: 4, h: 3, resizeHandles },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        rankbar: {
          padding: 2,
          position: "background",
          radius: 20,
        },
        rank: true,
        layout: {
          alignment: "vertical",
        },
        sort: {
          aggregation: {
            type: "sum",
          },
          by: "measure",
          direction: "desc",
        },
      },
      slots: [
        {
          name: "dimension",
          content: [
            {
              label: {
                en: "Product",
              },
              set: "5047ccf3-b7ba-4ad7-a1d8-0c48e07eda9f",
              column: "55389304-a1b1-443a-b461-4a68e14df161",
              type: "hierarchy",
            },
          ],
        },
      ],
    },
  ],
};

export default flexConfig;
