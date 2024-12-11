import { ApplicationConfig } from '@angular/core';
import { 
  InMemoryScrollingFeature,
  InMemoryScrollingOptions,
  withInMemoryScrolling,
  provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { STORAGE_PROVIDERS } from './shared/services/storage.service';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
};
const inMemoryScrollingFeature: InMemoryScrollingFeature = withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, inMemoryScrollingFeature), STORAGE_PROVIDERS, provideClientHydration(), provideAnimationsAsync(), provideHttpClient(withFetch())]
};
