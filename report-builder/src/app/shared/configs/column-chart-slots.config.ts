import { Slot } from '../models/slots';

export const columnChartSlotsConfig: Slot[] = [
  {
    name: 'measure',
    rotate: false,
    type: 'numeric',
    options: { isCumulativeSumEnabled: true },
    label: 'Measure',
    canAcceptMultipleColumns: true,
    canAcceptFormula: true
  },
  {
    name: 'x-axis',
    rotate: false,
    type: 'categorical',
    options: { areDatetimeOptionsEnabled: true },
    label: 'Category'
  },
  {
    name: 'legend',
    rotate: true,
    type: 'categorical',
    options: { areDatetimeOptionsEnabled: true },
    label: 'Group by'
  }
];
