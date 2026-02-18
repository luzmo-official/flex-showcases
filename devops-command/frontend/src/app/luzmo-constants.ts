import { FilterGroup, VizItemOptions, VizItemSlot, VizItemType } from "@luzmo/dashboard-contents-types";
import { LUZMO_CONTROL_CENTRE_LOADER_OPTIONS, LUZMO_CONTROL_CENTRE_THEME } from "./luzmo-theme.config";

type DeepPartial<T> = T extends object
  ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T;

export type LuzmoFlexChart = {
  id?: string;
  type: VizItemType;
  slots: VizItemSlot[];
  options: DeepPartial<VizItemOptions>;
  filters?: FilterGroup[];
}

export const GITHUB_PRS_DATASET_ID = 'ec1582eb-96c7-489c-b233-9bf90663725f';
export const JIRA_TASKS_DATASET_ID = '67cf3dfc-a718-4792-bbdf-b939c2c63f7b';
export const JIRA_BUGS_DATASET_ID = '3f4834f1-f7a5-46e4-a180-b21b08be9bf3';
export const BUG_TICKETS_DATE_COLUMN_ID = '5af3cc8a-9b3c-4791-aced-1a26a1356a69';
export const BUG_TICKETS_SQUAD_COLUMN_ID = '90b18762-7d28-40e1-9bc6-9f0a9aaad594';
export const BUG_TICKETS_SQUAD_DATASET_ID = '67cf3dfc-a718-4792-bbdf-b939c2c63f7b';
export const BUG_EVOLUTION_SQUAD_COLUMN_ID = '058489c9-8399-49e9-b977-9d0984df2426';

export type Squad = 'Forge' | 'Orbit' | 'Horizon';

export const BUGS_DELTA_CHART: LuzmoFlexChart = {
  type: 'column-chart',
  slots: [
    {
      name: 'measure',
      content: [
        {
          column: 'da7c7053-7bb1-46bd-9f28-7076b6c22814',
          set: '3f4834f1-f7a5-46e4-a180-b21b08be9bf3',
          label: {
            en: 'Delta'
          },
          type: 'numeric',
          subtype: null,
          format: ',.0af',
          lowestLevel: 0,
          currency: null,
          aggregationFunc: 'sum'
        }
      ]
    },
    {
      name: 'x-axis',
      content: [
        {
          type: 'datetime',
          datasetId: '3f4834f1-f7a5-46e4-a180-b21b08be9bf3',
          set: '3f4834f1-f7a5-46e4-a180-b21b08be9bf3',
          columnId: '5af3cc8a-9b3c-4791-aced-1a26a1356a69',
          column: '5af3cc8a-9b3c-4791-aced-1a26a1356a69',
          label: {
            en: 'Date'
          },
          lowestLevel: 9,
          format: '%amd~%Y %H:%M:%S.%L',
          level: 2
        }
      ]
    },
    {
      name: 'legend',
      content: []
    }
  ],
  options: {
    theme: { ...LUZMO_CONTROL_CENTRE_THEME },
    loader: { ...LUZMO_CONTROL_CENTRE_LOADER_OPTIONS },
    mode: 'grouped',
    categories: {
      colored: false
    },
    grid: {
      x: {
        enabled: false
      },
      y: {
        enabled: false
      }
    },
    axislabels: {
      x: {
        enabled: false,
        position: 'center'
      },
      y: {
        enabled: false,
        position: 'middle'
      }
    },
    axis: {
      x: {
        ticksMode: 'ticks'
      },
      y: {
        ticksMode: 'ticks',
        scale: 'linear'
      }
    },
    bars: {
      label: 'absolute'
    },
    filter: {},
    display: {
      title: false,
      legend: true,
      modeOption: false
    },
    legend: {
      position: 'topRight'
    },
    interactivity: {
      availableExportTypes: [],
      customEvents: undefined,
      customTooltip: undefined,
      exportTypes: [],
      select: true,
      urlConfig: {
        target: '_blank',
        url: undefined
      }
    },
    ranking: {
      active: false,
      direction: 'top',
      number: 10
    },
    limit: {
      number: 500
    },
    sort: {
      by: 'category',
      direction: 'asc'
    },
    title: {
      en: 'Reported/resolved bug delta'
    }
  }
};

export const OPEN_CLIENT_BUGS_EVOLUTION: LuzmoFlexChart = {
  type: 'line-chart',
  slots: [
    {
      name: 'measure',
      content: [
        {
          column: '73928e5f-0c38-4d6f-95ca-d6b3e878adc7',
          set: '3f4834f1-f7a5-46e4-a180-b21b08be9bf3',
          label: {
            en: 'Open client bugs'
          },
          type: 'numeric',
          subtype: null,
          format: ',.0af',
          lowestLevel: 0,
          currency: null,
          aggregationFunc: 'sum'
        }
      ]
    },
    {
      name: 'x-axis',
      content: [
        {
          column: '5af3cc8a-9b3c-4791-aced-1a26a1356a69',
          set: '3f4834f1-f7a5-46e4-a180-b21b08be9bf3',
          label: {
            en: 'Date'
          },
          type: 'datetime',
          subtype: null,
          format: '%amd~%Y %H:%M:%S.%L',
          lowestLevel: 9,
          level: 4,
          currency: null
        }
      ]
    },
    {
      name: 'legend',
      content: []
    }
  ],
  options: {
    theme: { ...LUZMO_CONTROL_CENTRE_THEME },
    loader: { ...LUZMO_CONTROL_CENTRE_LOADER_OPTIONS },
    interpolation: 'linear',
    grid: {
      x: {
        enabled: false
      },
      y: {
        enabled: true,
        style: 'solid',
        opacity: 0.15
      },
      y2: {
        enabled: false
      }
    },
    axislabels: {
      x: {
        enabled: false,
        position: 'center'
      },
      y: {
        enabled: false,
        position: 'middle'
      },
      y2: {
        enabled: false,
        position: 'middle'
      }
    },
    axis: {
      x: {
        ticksMode: 'ticks'
      },
      y: {
        scale: 'linear',
        ticksMode: 'gridlines',
        type: 'default',
        ticksDensity: 'compact'
      },
      y2: {
        active: false,
        measureIndexes: [1],
        scale: 'linear',
        ticksMode: 'ticks',
        type: 'default'
      }
    },
    lines: {
      strokeWidth: 2,
      gradient: false
    },
    markers: {
      enabled: false,
      size: 2
    },
    interactivity: {
      availableExportTypes: [],
      brush: true,
      customEvents: undefined,
      customTooltip: undefined,
      exportTypes: [],
      urlConfig: {
        target: '_blank',
        url: undefined
      }
    },
    display: {
      title: false,
      legend: true
    },
    legend: {
      position: 'bottom'
    },
    filter: {},
    nullBreak: false,
    missingValue: {
      type: 'no'
    },
    limit: {
      number: 10000
    },
    title: {
      en: 'Open client bug queue'
    },
    mode: 'grouped',
    guidelines: {
      lines: [],
      style: {
        type: '0',
        width: '2'
      }
    }
  }
};

export const CREATED_CLIENT_BUGS: LuzmoFlexChart = {
  type: 'line-chart',
  "slots": [
    {
      "name": "measure",
      "content": [
        {
          "type": "numeric",
          "set": "3f4834f1-f7a5-46e4-a180-b21b08be9bf3",
          "column": "c79db0aa-1d36-484b-b86b-465555ff5b5e",
          "label": {
            "en": "Reported client bugs"
          },
          "lowestLevel": 0,
          "format": ",.0af",
          "id": "05e78d35-84de-45c6-9dc1-43ad2994bed4",
          "aggregationFunc": "sum"
        }
      ]
    },
    {
      "name": "x-axis",
      "content": [
        {
          "type": "datetime",
          "set": "3f4834f1-f7a5-46e4-a180-b21b08be9bf3",
          "column": "5af3cc8a-9b3c-4791-aced-1a26a1356a69",
          "label": {
            "en": "Week"
          },
          "lowestLevel": 9,
          "format": "%amd~%Y %H:%M:%S.%L",
          "level": 4,
          "id": "62d10f90-6366-42f9-80df-34234a93074a"
        }
      ]
    },
    {
      "name": "legend",
      "content": []
    }
  ],
  "options": {
    theme: { ...LUZMO_CONTROL_CENTRE_THEME },
    loader: { ...LUZMO_CONTROL_CENTRE_LOADER_OPTIONS },
    "interpolation": "linear",
    "grid": {
      "x": {
        "enabled": false
      },
      "y": {
        "enabled": true,
        "style": "solid",
        "opacity": 0.15
      },
      "y2": {
        "enabled": false
      }
    },
    "axislabels": {
      "x": {
        "enabled": false,
        "position": "center"
      },
      "y": {
        "enabled": false,
        "position": "middle"
      },
      "y2": {
        "enabled": false,
        "position": "middle"
      }
    },
    "axis": {
      "x": {
        "ticksMode": "ticks"
      },
      "y": {
        "scale": "linear",
        "ticksMode": "gridlines",
        "type": "default",
        "ticksDensity": "compact"
      },
      "y2": {
        "active": false,
        "measureIndexes": [
          1
        ],
        "scale": "linear",
        "ticksMode": "ticks",
        "type": "default"
      }
    },
    "lines": {
      "strokeWidth": 1,
      "gradient": true
    },
    "markers": {
      "enabled": false,
      "size": 2
    },
    "interactivity": {
      "availableExportTypes": [],
      "brush": true,
      "customEvents": undefined,
      "customTooltip": undefined,
      "exportTypes": [],
      "urlConfig": {
        "target": "_blank",
        "url": undefined
      }
    },
    "display": {
      "title": false,
      "legend": true
    },
    "legend": {
      "position": "topRight"
    },
    "filter": {},
    "nullBreak": false,
    "missingValue": {
      "type": "manual",
      "value": 0
    },
    "limit": {
      "number": 10000
    },
    "title": {
      "en": "Newly reported client bugs"
    },
    "guidelines": {
      "lines": [
        {
          "color": "rgba(255, 255, 255, 0.7)",
          "type": "average"
        }
      ],
      "style": {
        "type": "3,3",
        "width": "1"
      }
    }
  }
};

export const OPEN_CLIENT_BUGS_LIST: LuzmoFlexChart = {
  type: 'regular-table',
  slots: [
    {
      name: 'columns',
      content: [
        {
          column: '8fa06696-5e61-47b5-99b3-f8561c015b48',
          set: '67cf3dfc-a718-4792-bbdf-b939c2c63f7b',
          label: {
            en: 'Priority'
          },
          type: 'hierarchy',
          subtype: null,
          lowestLevel: 0,
          level: null,
          id: 'edf73788-eca0-4f98-a31d-6e45152a75cc',
          currency: null
        },
        {
          type: 'hierarchy',
          datasetId: '67cf3dfc-a718-4792-bbdf-b939c2c63f7b',
          set: '67cf3dfc-a718-4792-bbdf-b939c2c63f7b',
          columnId: '90b18762-7d28-40e1-9bc6-9f0a9aaad594',
          column: '90b18762-7d28-40e1-9bc6-9f0a9aaad594',
          label: {
            en: 'Squad'
          },
          lowestLevel: 0,
          format: '',
          level: null,
          id: '045a2d0c-520a-4f04-9e7f-221f12899222'
        },
        {
          type: 'datetime',
          datasetId: '67cf3dfc-a718-4792-bbdf-b939c2c63f7b',
          set: '67cf3dfc-a718-4792-bbdf-b939c2c63f7b',
          columnId: '9ef7e288-21cc-4f41-8115-135116e1ba04',
          column: '9ef7e288-21cc-4f41-8115-135116e1ba04',
          label: {
            en: 'Create date'
          },
          lowestLevel: 9,
          format: '%d/%m/%Y',
          level: 5,
          id: '699027df-1eed-4be2-ba55-2389ebad824e'
        },
        {
          column: '4fc47db1-fc7f-47f8-96a1-31acc8106676',
          set: '67cf3dfc-a718-4792-bbdf-b939c2c63f7b',
          label: {
            en: 'Ticket name'
          },
          type: 'hierarchy',
          subtype: null,
          lowestLevel: 0,
          level: null,
          id: 'ca2c9f7d-2da2-441b-9e01-f2453710666f',
          currency: null
        }
      ]
    }
  ],
  options: {
    theme: { ...LUZMO_CONTROL_CENTRE_THEME },
    loader: { ...LUZMO_CONTROL_CENTRE_LOADER_OPTIONS },
    display: {
      title: false
    },
    tableBorders: {
      type: 'rows',
      width: 1,
      color: 'rgba(237,237,237,0.2)'
    },
    headers: {},
    alternateRowColor: false,
    interactivity: {
      availableExportTypes: [],
      customEvents: undefined,
      exportTypes: [],
      urlConfig: {
        target: '_blank',
        url: undefined
      }
    },
    rowHeight: 32,
    infiniteScrolling: true,
    sortingMode: 'multiColumn' as any,
    limit: {
      number: 10000
    },
    sort: [
      {
        id: '699027df-1eed-4be2-ba55-2389ebad824e',
        set: '67cf3dfc-a718-4792-bbdf-b939c2c63f7b',
        column: '9ef7e288-21cc-4f41-8115-135116e1ba04',
        direction: 'desc',
        level: 5
      }
    ],
    title: {
      en: 'Open client bug list'
    },
    "columns": [
      {
        "slotContentId": "edf73788-eca0-4f98-a31d-6e45152a75cc",
        "mode": "normal",
        "sortIndex": undefined,
        "sortOrder": undefined,
        "width": {
          "desktop": 83.5
        },
        "textAlign": "left",
        "wrapText": false
      },
      {
        "slotContentId": "045a2d0c-520a-4f04-9e7f-221f12899222",
        "mode": "categoryBadge",
        "sortIndex": undefined,
        "sortOrder": undefined,
        "width": {
          "desktop": 83.5
        },
        "textAlign": "left",
      },
      {
        "slotContentId": "699027df-1eed-4be2-ba55-2389ebad824e",
        "mode": "normal",
        "sortIndex": 1,
        "sortOrder": "desc",
        "width": {
          "desktop": 120
        },
        "textAlign": "left",
      },
      {
        "slotContentId": "ca2c9f7d-2da2-441b-9e01-f2453710666f",
        "mode": "normal",
        "sortIndex": undefined,
        "sortOrder": undefined,
        "width": undefined,
        "textAlign": "left",
        "wrapText": true
      }
    ],
    hiddenColumns: []
  }
};

export type PrLevel = 'SQUAD' | 'USER' | 'REPO';

export const PR_LEVEL_SQUAD_CONTENT = {
  type: 'hierarchy',
  datasetId: 'ec1582eb-96c7-489c-b233-9bf90663725f',
  set: 'ec1582eb-96c7-489c-b233-9bf90663725f',
  columnId: '48857987-bce7-4ff8-8b18-7801d99e399c',
  column: '48857987-bce7-4ff8-8b18-7801d99e399c',
  label: { en: 'Squad' },
  lowestLevel: 0,
  format: '',
  level: null,
  id: '91943249-fccc-47f9-a8de-e6721c073626'
} as const;

export const PR_LEVEL_USER_CONTENT = {
  type: 'hierarchy',
  datasetId: 'ec1582eb-96c7-489c-b233-9bf90663725f',
  set: 'ec1582eb-96c7-489c-b233-9bf90663725f',
  columnId: 'c99baaa4-7c13-422f-9e4a-7d60e3bd207c',
  column: 'c99baaa4-7c13-422f-9e4a-7d60e3bd207c',
  label: { en: 'User' },
  lowestLevel: 0,
  format: '',
  level: null,
  id: '83aa3085-2135-4da2-9047-99d8bf094fad'
} as const;

export const PR_LEVEL_REPO_CONTENT = {
  type: 'hierarchy',
  datasetId: 'ec1582eb-96c7-489c-b233-9bf90663725f',
  set: 'ec1582eb-96c7-489c-b233-9bf90663725f',
  columnId: '61f7b270-9046-4219-aff8-693146168b67',
  column: '61f7b270-9046-4219-aff8-693146168b67',
  label: { en: 'Repository' },
  lowestLevel: 0,
  format: '',
  level: null,
  id: 'b221892d-fff3-4555-9e41-03978f621be8'
} as const;

export const PRS_MERGED_BY_SQUAD: LuzmoFlexChart = {
  type: 'sunburst-chart',
  slots: [
    {
      name: 'measure',
      content: [
        {
          type: 'numeric',
          datasetId: 'ec1582eb-96c7-489c-b233-9bf90663725f',
          set: 'ec1582eb-96c7-489c-b233-9bf90663725f',
          columnId: '7c333d08-be83-4946-aa04-046b02fed174',
          column: '7c333d08-be83-4946-aa04-046b02fed174',
          label: {
            en: 'PRs merged'
          },
          lowestLevel: 0,
          format: '.0af',
          id: 'ee9825e8-c13b-4d8d-9797-168c3b018dc2'
        }
      ]
    },
    {
      name: 'levels',
      content: [
        PR_LEVEL_SQUAD_CONTENT,
        PR_LEVEL_USER_CONTENT
      ]
    }
  ],
  options: {
    theme: { ...LUZMO_CONTROL_CENTRE_THEME },
    loader: { ...LUZMO_CONTROL_CENTRE_LOADER_OPTIONS },
    display: {
      title: false,
      legend: false,
      labels: true
    },
    legend: {
      position: 'right'
    },
    interactivity: {
      availableExportTypes: [],
      customTooltip: null,
      exportTypes: [],
      select: true,
      urlConfig: {
        target: '_blank',
        url: undefined
      }
    },
    filter: {},
    limit: {
      number: 500
    },
    sort: {
      by: 'measure',
      direction: 'desc'
    },
    title: {
      en: 'PRs merged by squad'
    }
  },
  filters: [
    {
      id: '2d8b91ff-88ae-4177-9dc5-fdfcbf0fc7e0',
      origin: 'itemFilter',
      condition: 'and',
      filters: [
        {
          expression: '? not in ?',
          parameters: [
            {
              column_id: 'c99baaa4-7c13-422f-9e4a-7d60e3bd207c',
              dataset_id: 'ec1582eb-96c7-489c-b233-9bf90663725f',
              level: undefined
            },
            ['_$Unassigned1']
          ]
        }
      ]
    }
  ]
};

export const PRS_PER_REPO: LuzmoFlexChart = {
  type: 'sankey-diagram',
  slots: [
    {
      name: 'source',
      content: [
        {
          type: 'hierarchy',
          datasetId: 'ec1582eb-96c7-489c-b233-9bf90663725f',
          set: 'ec1582eb-96c7-489c-b233-9bf90663725f',
          columnId: 'c99baaa4-7c13-422f-9e4a-7d60e3bd207c',
          column: 'c99baaa4-7c13-422f-9e4a-7d60e3bd207c',
          label: {
            en: 'Squad'
          },
          lowestLevel: 0,
          format: '',
          level: null,
          id: '5c0b8e8e-7c6d-4d9c-a5a7-2740ed3a3669'
        }
      ]
    },
    {
      name: 'category',
      content: []
    },
    {
      name: 'measure',
      content: [
        {
          type: 'numeric',
          set: 'ec1582eb-96c7-489c-b233-9bf90663725f',
          column: '7c333d08-be83-4946-aa04-046b02fed174',
          label: {
            en: 'PRs merged'
          },
          lowestLevel: 0,
          format: '.0af',
          id: 'fd317735-0619-4fd8-8990-4bc0f77040aa'
        }
      ]
    },
    {
      name: 'destination',
      content: [
        {
          type: 'hierarchy',
          datasetId: 'ec1582eb-96c7-489c-b233-9bf90663725f',
          set: 'ec1582eb-96c7-489c-b233-9bf90663725f',
          columnId: '61f7b270-9046-4219-aff8-693146168b67',
          column: '61f7b270-9046-4219-aff8-693146168b67',
          label: {
            en: 'Repository'
          },
          lowestLevel: 0,
          format: '',
          level: null,
          id: 'd2bb4e40-c5c5-45e2-86fe-6b2943ebc566'
        }
      ]
    }
  ],
  options: {
    theme: { ...LUZMO_CONTROL_CENTRE_THEME },
    loader: { ...LUZMO_CONTROL_CENTRE_LOADER_OPTIONS },
    labels: {
      display: true,
      value: false
    },
    display: {
      title: false
    },
    nodes: {
      colored: true
    },
    links: {
      value: false
    },
    interactivity: {
      availableExportTypes: [],
      customEvents: undefined,
      exportTypes: [],
      select: true,
      urlConfig: {
        target: '_blank',
        url: undefined
      }
    },
    alignment: 'justify',
    colors: {
      byCategory: true,
      linkColor: 'gradient'
    },
    filter: {},
    limit: {
      number: 500
    },
    title: {
      en: 'PRs per repository'
    },
    type: 'sankey'
  },
  filters: [
    {
      condition: 'and',
      filters: [
        {
          expression: '? not in ?',
          parameters: [
            {
              column_id: 'c99baaa4-7c13-422f-9e4a-7d60e3bd207c',
              dataset_id: 'ec1582eb-96c7-489c-b233-9bf90663725f',
              level: undefined
            },
            ['_$Unassigned1']
          ],
          properties: {
            type: 'where',
            id: '87d1fdde-c321-411d-b3fb-0ef57234a6d7',
            origin: 'itemFilter'
          }
        }
      ]
    }
  ]
};
