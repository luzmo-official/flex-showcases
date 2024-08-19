export interface DatasetResult {
  result: 'error' | 'success';
  dataset?: Dataset;
  error: string;
}

export interface Dataset {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  columns: DatasetColumn[];
}

export interface DatasetColumn {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  type: string;
}