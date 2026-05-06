import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { DataService } from '../shared/services/data.service';
import { AuthService } from '../shared/services/auth.service';

import '@luzmo/analytics-components-kit/data-field-panel';

@Component({
  selector: 'app-data-panel',
  templateUrl: './data-panel.component.html',
  styleUrl: './data-panel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DataPanelComponent {
  private readonly dataService = inject(DataService);
  private readonly authService = inject(AuthService);

  authKey = this.authService.getAuth().authKey;
  authToken = this.authService.getAuth().authToken;
  datasetIds = [
    '70902e57-8c32-4890-a728-650c686c1f5d',
    'e037cf59-4913-4221-a188-364ebdb42062',
  ];

  onDatasetChanged(event: Event) {
    const detail = (event as CustomEvent<{ datasetId: string }>).detail;
    if (detail?.datasetId) {
      this.dataService.setDatasetIdForAI(detail.datasetId);
    }
  }
}
