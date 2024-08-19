export interface AppEnvironment {
  production: boolean;
  googleAnalyticsId: string;
  devConfig: {
    landingUrl?: string;
    appUrl?: string;
    apiHost?: string;
    apiPort?: number | string;
    cookieDomain?: string;
    cookiePath?: string;
    environment?: string;
  };
}
