export interface DatasetAccess {
  id: string;
  rights: {
    Use: boolean;
    Read: boolean;
    Modify: boolean;
    Own: boolean;
  };
}

export interface AuthorizationResponse {
  count: number;
  rows: Array<{
    access: {
      datasets: DatasetAccess[];
    };
  }>;
}

export interface QueryResponse {
  query_id: string;
  cached: boolean;
  performance: {
    validating: number;
    preparing: number;
    queuing: number;
    querying: number;
    processing: number;
    rows: number;
  };
  total_input_rows: number;
  total_queries: number;
  data: number[][];
  stats: Record<string, unknown>;
}

export interface DatasetMetadata {
  id: string;
  type: string;
  name: {
    en?: string;
    [key: string]: string | undefined;
  };
}

export interface SecurableResponse {
  count: number;
  rows: DatasetMetadata[];
}
