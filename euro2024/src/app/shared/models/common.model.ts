export type ThemeMode = 'dark' | 'light' | 'auto';

export interface RowsData<T> {
  count: number;
  rows: T[];
}
