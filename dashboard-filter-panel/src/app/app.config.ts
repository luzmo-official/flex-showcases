/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://luzmo-angular-examples/license
 */

import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { STORAGE_PROVIDERS } from './shared/services/storage.service';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()), STORAGE_PROVIDERS],
};
