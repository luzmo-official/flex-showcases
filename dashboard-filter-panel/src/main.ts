import {
  bootstrapApplication,
  provideProtractorTestingSupport,
} from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import routeConfig from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxLuzmoDashboardModule } from '@luzmo/ngx-embed';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideProtractorTestingSupport(),
    provideRouter(routeConfig),
    provideAnimationsAsync(), importProvidersFrom(NgxLuzmoDashboardModule), importProvidersFrom(NgxLuzmoDashboardModule),
  ],
}).catch((err) => console.error(err));
