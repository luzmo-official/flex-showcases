import { Component, computed, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartService } from '../shared/services/chart.service';
import { AuthService } from '../shared/services/auth.service';
import { ChartConfigPanelComponent } from './chart-config-panel/chart-config-panel.component';
import { ChartSettingsComponent } from './chart-config-panel/chart-settings/chart-settings.component';
import { FiltersPanelComponent } from './filters-panel/filters-panel.component';

@Component({
    selector: 'app-chart-panel',
    imports: [MatTabsModule, ChartConfigPanelComponent, ChartSettingsComponent, FiltersPanelComponent],
    templateUrl: './chart-panel.component.html',
    styleUrl: './chart-panel.component.scss'
})
export class ChartPanelComponent {
  readonly chartService = inject(ChartService);
  private readonly authService = inject(AuthService);

  authKey = this.authService.getAuth().authKey;
  authToken = this.authService.getAuth().authToken;
  datasetIds = [
    '70902e57-8c32-4890-a728-650c686c1f5d',
    'e037cf59-4913-4221-a188-364ebdb42062',
  ];
  filterCount = computed(() => ((this.chartService.filters()) ?? [])?.length ?? 0);
}
