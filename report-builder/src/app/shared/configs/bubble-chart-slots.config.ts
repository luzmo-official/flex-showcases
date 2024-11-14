import { Slot } from '../models/slots';

export const bubbleChartSlotsConfig: Slot[] = [
  {
    name: 'measure',
    rotate: false,
    label: 'Measure',
    type: 'numeric',
    canAcceptFormula: true
  },
  {
    name: 'category',
    rotate: false,
    label: 'Category',
    options: { areDatetimeOptionsEnabled: true },
    type: 'categorical',
    isRequired: true
  },
  {
    name: 'color',
    label: 'Color',
    options: { areDatetimeOptionsEnabled: true },
    rotate: true,
    type: 'categorical'
  }
];
