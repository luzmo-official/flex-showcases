import { Slot } from '../models/slots';

export const areaChartSlotsConfig: Slot[] = [
  {
    name: 'x-axis',
    rotate: false,
    label: 'X Axis',
    type: 'mixed',
    options: { isAggregationDisabled: true, isBinningDisabled: true, areDatetimeOptionsEnabled: true },
    isRequired: true
  },
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
    name: 'legend',
    rotate: true,
    label: 'Group by',
    options: { areDatetimeOptionsEnabled: true },
    type: 'categorical'
  }
];
