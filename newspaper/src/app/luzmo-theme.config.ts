import type { ThemeConfig } from '@luzmo/dashboard-contents-types';

export const NEWSPAPER_LIGHT_THEME: ThemeConfig = {
  background: 'transparent',
  itemsBackground: 'rgb(255, 241, 229)',
  font: {
    fontFamily: 'DM Sans',
    'font-style': 'normal',
    'font-weight': 400,
    fontSize: 12,
  },
  colors: [
    'rgb(13, 118, 128)',   // teal
    'rgb(26, 154, 165)',   // teal-light
    'rgb(153, 15, 61)',    // red
    'rgb(184, 120, 48)',   // warm amber
    'rgb(158, 142, 126)',  // muted
    'rgb(13, 118, 128)',
    'rgb(26, 154, 165)',
    'rgb(153, 15, 61)',
    'rgb(184, 120, 48)',
    'rgb(158, 142, 126)',
  ],
  mainColor: 'rgb(13, 118, 128)',
  title: {
    align: 'left',
    bold: true,
    italic: false,
    underline: false,
    border: false,
    fontSize: 14,
    lineHeight: 24,
  },
  borders: {
    'border-color': 'rgb(224, 210, 196)',
    'border-radius': '2px',
    'border-style': 'solid',
    'border-top-width': '0px',
    'border-left-width': '0px',
    'border-bottom-width': '0px',
    'border-right-width': '0px',
  },
  boxShadow: {
    size: 'none',
    color: 'rgba(13, 118, 128, 0.05)',
  },
  axis: {
    fontSize: 12,
  },
  margins: [16, 16],
  legend: {
    type: 'circle',
    fontSize: 12,
    lineHeight: 24,
  },
  tooltip: {
    background: 'rgb(29, 25, 22)',
    opacity: 0.90,
    lineHeight: 1.5,
    fontSize: 12,
  },
  itemSpecific: {
    rounding: 2,
    padding: 12,
  },
};

export const NEWSPAPER_DARK_THEME: ThemeConfig = {
  background: 'transparent',
  itemsBackground: 'rgb(29, 25, 22)',
  font: {
    fontFamily: 'DM Sans',
    'font-style': 'normal',
    'font-weight': 400,
    fontSize: 12,
  },
  colors: [
    'rgb(26, 154, 165)',   // teal
    'rgb(212, 163, 74)',   // warm gold
    'rgb(200, 65, 95)',    // rose
    'rgb(195, 175, 155)',  // warm sand
    'rgb(90, 195, 200)',   // sky teal
    'rgb(175, 115, 70)',   // sienna
    'rgb(230, 190, 100)',  // light gold
    'rgb(165, 60, 75)',    // deep berry
    'rgb(26, 154, 165)',
    'rgb(212, 163, 74)',
  ],
  mainColor: 'rgb(26, 154, 165)',
  title: {
    align: 'left',
    bold: true,
    italic: false,
    underline: false,
    border: false,
    fontSize: 14,
    lineHeight: 24,
  },
  borders: {
    'border-color': 'rgb(61, 53, 48)',
    'border-radius': '2px',
    'border-style': 'solid',
    'border-top-width': '0px',
    'border-left-width': '0px',
    'border-bottom-width': '0px',
    'border-right-width': '0px',
  },
  boxShadow: {
    size: 'none',
    color: 'rgba(26, 154, 165, 0.05)',
  },
  axis: {
    fontSize: 12,
  },
  margins: [16, 16],
  legend: {
    type: 'circle',
    fontSize: 12,
    lineHeight: 24,
  },
  tooltip: {
    background: 'rgb(246, 233, 216)',
    opacity: 0.90,
    lineHeight: 1.5,
    fontSize: 12,
  },
  itemSpecific: {
    rounding: 2,
    padding: 12,
  },
};

export const NEWSPAPER_LIGHT_LOADER_OPTIONS = {
  spinnerColor: 'rgb(13, 118, 128)',
  spinnerBackground: 'rgb(246, 233, 216)',
  background: 'transparent',
};

export const NEWSPAPER_DARK_LOADER_OPTIONS = {
  spinnerColor: 'rgb(26, 154, 165)',
  spinnerBackground: 'rgb(42, 36, 32)',
  background: 'transparent',
};
