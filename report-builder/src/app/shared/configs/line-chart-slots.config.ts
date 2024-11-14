import { Slot } from '../models/slots';

export const lineChartSlotsConfig: Slot[] = [
  {
    name: 'measure',
    rotate: false,
    label: 'Measure',
    type: 'numeric',
    options: { isCumulativeSumEnabled: true },
    canAcceptMultipleColumns: true,
    canAcceptFormula: true
  },
  {
    name: 'x-axis',
    rotate: false,
    label: 'X axis',
    type: 'mixed',
    options: { isAggregationDisabled: true, isBinningDisabled: true, areDatetimeOptionsEnabled: true },
    isRequired: true
  },
  {
    name: 'legend',
    rotate: true,
    label: 'Group by',
    options: { areDatetimeOptionsEnabled: true },
    type: 'categorical'
  }
];
