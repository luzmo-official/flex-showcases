import { Slot } from '../models/slots';

export const donutChartSlotsConfig: Slot[] = [
  {
    name: 'measure',
    rotate: false,
    label: 'Measure',
    type: 'numeric',
    canAcceptMultipleColumns: true,
    canAcceptFormula: true
  },
  {
    name: 'category',
    rotate: false,
    label: 'Category',
    type: 'categorical',
    options: { areDatetimeOptionsEnabled: true }
  }
];
