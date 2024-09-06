const initialState = {
  layout: [
    {
      w: 4,
      h: 2,
      x: 4,
      y: 0,
      i: "Date Filter",
    },
    {
      w: 4,
      h: 2,
      x: 8,
      y: 0,
      i: "Brand Filter",
    },
    {
      w: 4,
      h: 5,
      x: 0,
      y: 0,
      i: "Product Filter",
    },
    {
      w: 4,
      h: 4,
      x: 0,
      y: 5,
      i: "Total Sales Volume",
    },
    {
      w: 4,
      h: 10,
      x: 0,
      y: 9,
      i: "Donut - Sales Volume by Product",
    },
    {
      w: 8,
      h: 17,
      x: 4,
      y: 2,
      i: "Bar Chart - Sales by Product & Location",
    },
    {
      w: 12,
      h: 10,
      x: 0,
      y: 19,
      i: "Table - Product, Volume & Location",
    },
  ],
  activeCharts: [
    {
      title: "Date Filter",
      type: "date-filter",
      layout: {
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        i: "Date Filter",
      },
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
      layout: {
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        i: "Brand Filter",
      },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        placeholder: {
          en: "Select Brand",
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
      layout: {
        x: 0,
        y: 0,
        w: 4,
        h: 5,
        i: "Product Filter",
      },
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
      title: "Total Sales Volume",
      type: "evolution-number",
      layout: {
        x: 0,
        y: 0,
        w: 4,
        h: 4,
        i: "Total Sales Volume",
      },
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
      title: "Donut - Sales Volume by Product",
      type: "donut-chart",
      layout: {
        x: 0,
        y: 0,
        w: 4,
        h: 10,
        i: "Donut - Sales Volume by Product",
      },
      options: {
        theme: {
          id: "default_dark",
        },
        display: {
          title: false,
        },
        legend: {
          position: "bottom",
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
      title: "Bar Chart - Sales by Product & Location",
      type: "bar-chart",
      layout: {
        x: 0,
        y: 0,
        w: 6,
        h: 14,
        i: "Bar Chart - Sales by Product & Location",
      },
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
        legend: {
          position: "bottom",
        },
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
      title: "Table - Product, Volume & Location",
      type: "regular-table",
      layout: {
        x: 0,
        y: 0,
        w: 12,
        h: 10,
        i: "Table - Product, Volume & Location",
      },
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
};

export default initialState;
