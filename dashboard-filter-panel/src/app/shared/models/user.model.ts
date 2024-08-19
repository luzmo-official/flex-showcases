import { AuthType } from './common.model';

export type User = {
  userId?: string;
  authenticated: boolean;
  authType?: AuthType;
  key?: string;
  token?: string;
  expiry?: string;
  region?: string;
  baseApiUrl?: string;
  email?: string;
  name?: string;
};

export { AuthType } from './common.model';
