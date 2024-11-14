import { Slot } from '../models/slots';

export const treemapChartSlotsConfig: Slot[] = [
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
    type: 'categorical',
    options: { areDatetimeOptionsEnabled: true },
    isRequired: true
  },
  {
    name: 'color',
    rotate: true,
    label: 'Color',
    options: { areDatetimeOptionsEnabled: true },
    type: 'categorical'
  }
];
