import { AppEnvironment } from './environment-model';

export const environment: AppEnvironment = {
  production: true,
  googleAnalyticsId: 'G-ENBBT8KX0E',
  devConfig: {
    landingUrl: 'https://developer.luzmo.com',
    appUrl: 'https://app.luzmo.com',
    apiHost: 'https://api.luzmo.com',
    apiPort: '',
    cookieDomain: 'developer.luzmo.com',
    cookiePath: '/',
    environment: 'production'
  }
};
