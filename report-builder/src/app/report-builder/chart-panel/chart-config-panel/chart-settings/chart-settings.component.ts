import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input } from '@angular/core';
import { ChartService } from '../../../shared/services/chart.service';

import '@luzmo/analytics-components-kit/item-option-panel';

@Component({
    selector: 'app-chart-settings',
    imports: [],
    templateUrl: './chart-settings.component.html',
    styleUrl: './chart-settings.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChartSettingsComponent {
  @Input({ required: true }) authKey!: string;
  @Input({ required: true }) authToken!: string;

  readonly chartService = inject(ChartService);

  onOptionsChanged(event: Event) {
    const detail = (event as CustomEvent<{ options: Record<string, unknown> }>).detail;
    this.chartService.updateOptions(detail?.options ?? {});
  }
}
