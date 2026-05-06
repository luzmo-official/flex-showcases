import type { GridItemData } from './cfo-types';

// Grid compatibility helpers for legacy snapshots and runtime layout safety.
// These functions are deterministic and side-effect free.
export interface MinSizeByVizType {
  chart: { x: number; y: number };
  kpi: { x: number; y: number };
}

export function normalizePosition(
  type: string,
  position: NonNullable<GridItemData['position']>,
  minSizeByVizType: MinSizeByVizType
): NonNullable<GridItemData['position']> {
  const minByType = type === 'conditional-number' ? minSizeByVizType.kpi : minSizeByVizType.chart;
  const minSizeX = toPositiveInt(position.minSizeX, minByType.x);
  const minSizeY = toPositiveInt(position.minSizeY, minByType.y);
  const maxSizeX = toOptionalPositiveInt(position.maxSizeX, minSizeX);
  const maxSizeY = toOptionalPositiveInt(position.maxSizeY, minSizeY);
  const sizeX = clamp(toPositiveInt(position.sizeX, minSizeX), minSizeX, maxSizeX);
  const sizeY = clamp(toPositiveInt(position.sizeY, minSizeY), minSizeY, maxSizeY);
  const row = toNonNegativeInt(position.row, 0);
  const col = toNonNegativeInt(position.col, 0);

  return {
    sizeX,
    sizeY,
    row,
    col,
    minSizeX,
    minSizeY,
    ...(typeof maxSizeX === 'number' ? { maxSizeX } : {}),
    ...(typeof maxSizeY === 'number' ? { maxSizeY } : {})
  };
}

export function normalizeLegacyVizTypes(
  items: GridItemData[],
  supportedTypes: ReadonlySet<string>
): { items: GridItemData[]; changed: boolean } {
  let changed = false;

  const nextItems = items.map((item) => {
    if (supportedTypes.has(item.type)) {
      return item;
    }

    changed = true;
    return {
      ...item,
      type: 'line-chart'
    };
  });

  return { items: nextItems, changed };
}

export function enforcePositionGuards(
  items: GridItemData[],
  minSizeByVizType: MinSizeByVizType
): { items: GridItemData[]; changed: boolean } {
  let changed = false;

  const nextItems = items.map((item) => {
    if (!item.position) {
      return item;
    }

    const normalized = normalizePosition(item.type, item.position, minSizeByVizType);
    const same =
      item.position.sizeX === normalized.sizeX &&
      item.position.sizeY === normalized.sizeY &&
      item.position.row === normalized.row &&
      item.position.col === normalized.col &&
      item.position.minSizeX === normalized.minSizeX &&
      item.position.minSizeY === normalized.minSizeY &&
      item.position.maxSizeX === normalized.maxSizeX &&
      item.position.maxSizeY === normalized.maxSizeY;

    if (same) {
      return item;
    }

    changed = true;
    return {
      ...item,
      position: normalized
    };
  });

  return { items: nextItems, changed };
}

export function backfillNumericLabelsForLegacyCharts(
  items: GridItemData[]
): { items: GridItemData[]; changed: boolean } {
  let changed = false;

  const nextItems = items.map((item) => {
    if (!item.options || typeof item.options !== 'object') {
      return item;
    }

    const options = item.options as Record<string, unknown>;

    if (item.type === 'bar-chart' || item.type === 'column-chart') {
      const barsValue = options['bars'];
      const bars = barsValue && typeof barsValue === 'object' ? (barsValue as Record<string, unknown>) : {};

      if (bars['label'] === undefined) {
        changed = true;
        return {
          ...item,
          options: {
            ...options,
            bars: {
              ...bars,
              label: 'absolute'
            }
          }
        };
      }

      return item;
    }

    if (item.type === 'donut-chart') {
      const displayValue = options['display'];
      const display = displayValue && typeof displayValue === 'object' ? (displayValue as Record<string, unknown>) : {};

      if (display['values'] === undefined) {
        changed = true;
        return {
          ...item,
          options: {
            ...options,
            display: {
              ...display,
              values: 'absolute'
            }
          }
        };
      }
    }

    return item;
  });

  return { items: nextItems, changed };
}

export function compactInitialKpiTiles(
  items: GridItemData[]
): { items: GridItemData[]; changed: boolean } {
  const kpiIds = new Set(['kpi-revenue', 'kpi-ebitda-margin', 'kpi-fcf-margin', 'kpi-leverage']);
  let changed = false;

  const nextItems = items.map((item) => {
    if (!item.id || !kpiIds.has(item.id) || !item.position) {
      return item;
    }

    if (item.position.row === 0 && item.position.sizeY > 8) {
      changed = true;
      return {
        ...item,
        position: {
          ...item.position,
          sizeY: 8
        }
      };
    }

    return item;
  });

  return { items: nextItems, changed };
}

function toPositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.round(value);
}

function toNonNegativeInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return Math.round(value);
}

function toOptionalPositiveInt(value: unknown, lowerBound: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  const parsed = Math.round(value);
  return parsed >= lowerBound ? parsed : lowerBound;
}

function clamp(value: number, min: number, max?: number): number {
  if (typeof max !== 'number') {
    return Math.max(value, min);
  }

  return Math.min(Math.max(value, min), max);
}
