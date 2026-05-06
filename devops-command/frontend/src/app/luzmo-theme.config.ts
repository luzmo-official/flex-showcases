import type { ThemeConfig } from '@luzmo/dashboard-contents-types';

export const LUZMO_CONTROL_CENTRE_THEME: ThemeConfig = {
  type: 'custom',
  darkOrLight: 'dark',
  background: 'rgb(10, 10, 10)',
  itemsBackground: 'rgb(17, 17, 17)',
  font: {
    fontFamily: 'Fira Mono',
    'font-style': 'normal',
    'font-weight': 400,
    fontSize: 12,
  },
  colors: [
    'rgb(0, 255, 65)', // terminal-green
    'rgb(57, 255, 20)', // terminal-dim
    'rgb(34, 197, 94)', // terminal-muted
    'rgb(0, 255, 255)', // cyber-cyan
    'rgb(22, 101, 52)', // terminal-dark
    'rgb(0, 255, 65)',
    'rgb(57, 255, 20)',
    'rgb(34, 197, 94)',
    'rgb(0, 255, 255)',
    'rgb(22, 101, 52)',
  ],
  mainColor: 'rgb(0, 255, 65)',
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
    'border-color': 'rgb(26, 61, 26)',
    'border-radius': '0px',
    'border-style': 'solid',
    'border-top-width': '1px',
    'border-left-width': '1px',
    'border-bottom-width': '1px',
    'border-right-width': '1px',
  },
  boxShadow: {
    size: 'none',
    color: 'rgba(0, 255, 65, 0.05)',
  },
  axis: {
    fontSize: 12,
  },
  margins: [16, 16],
  legend: {
    type: 'normal',
    fontSize: 12,
    lineHeight: 16,
  },
  tooltip: {
    background: 'rgb(17, 17, 17)',
    opacity: 0.95,
    lineHeight: 1.5,
    fontSize: 12,
  },
  itemSpecific: {
    rounding: 0,
    padding: 12,
  },
};

export interface LuzmoLoaderOptions {
  mode: 'dark' | 'light';
  loaderBackground: string;
  loaderFontColor: string;
  loaderSpinnerColor: string;
  spinnerBackgroundColor: string;
  mainColor: string;
  accentColor: string;
}

export const LUZMO_CONTROL_CENTRE_LOADER_OPTIONS = {
  spinnerColor: 'rgb(0, 255, 65)',
  spinnerBackground: 'rgb(17, 17, 17)',
  background: 'transparent'
};
