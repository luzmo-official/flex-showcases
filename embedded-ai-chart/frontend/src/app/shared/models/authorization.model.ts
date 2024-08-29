export interface AuthorizationResult {
  result: 'error' | 'success';
  token?: Authorization;
  error: string;
}

export interface Authorization {
  id: string;
  token: string;
}