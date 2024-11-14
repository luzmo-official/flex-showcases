import { Slot } from '../models/slots';

export const barChartSlotsConfig: Slot[] = [
  {
    name: 'y-axis',
    label: 'Category',
    type: 'categorical',
    rotate: true,
    options: { areDatetimeOptionsEnabled: true }
  },
  {
    name: 'measure',
    label: 'Measure',
    type: 'numeric',
    rotate: false,
    options: { isCumulativeSumEnabled: true },
    canAcceptMultipleColumns: true,
    canAcceptFormula: true
  },
  {
    name: 'legend',
    label: 'Group by',
    type: 'categorical',
    rotate: true,
    options: { areDatetimeOptionsEnabled: true }
  }
];
