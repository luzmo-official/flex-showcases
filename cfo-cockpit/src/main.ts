import '@luzmo/analytics-components-kit/draggable-data-fields-panel';
import '@luzmo/analytics-components-kit/edit-item';
import '@luzmo/analytics-components-kit/grid';
import '@luzmo/analytics-components-kit/item-data-drop-panel';
import '@luzmo/lucero/action-button';
import '@luzmo/lucero/action-group';
import '@luzmo/lucero/button';

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
void bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
