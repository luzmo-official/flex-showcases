// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.production.ts`.
// The list of file replacements can be found in `angular.json`.

import { environmentLocalCommonConfig } from './environment-common-config';
import { AppEnvironment } from './environment-model';

export const environment: AppEnvironment = {
  ...environmentLocalCommonConfig,
  googleAnalyticsId: 'G-ENBBT8KX0E',
  // We run the app by default pointed to prod.
  // TODO: provide way to run it locally as well
  devConfig: {
    landingUrl: 'https://developer.luzmo.com',
    appUrl: 'https://app.luzmo.com',
    apiHost: 'https://api.luzmo.com',
    apiPort: 443,
    cookieDomain: 'localhost',
    cookiePath: '/',
    environment: 'develop'
  }
};
