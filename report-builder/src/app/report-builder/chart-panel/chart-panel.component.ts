import { Component, computed, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FiltersPanelComponent } from './filters-panel/filters-panel.component';
import { ChartConfigPanelComponent } from './chart-config-panel/chart-config-panel.component';
import { ChartService } from '../shared/services/chart.service';

@Component({
  selector: 'app-chart-panel',
  standalone: true,
  imports: [MatTabsModule, FiltersPanelComponent, ChartConfigPanelComponent],
  templateUrl: './chart-panel.component.html',
  styleUrl: './chart-panel.component.scss',
})
export class ChartPanelComponent {
  readonly chartService = inject(ChartService);
  filterCount = computed(() => ((this.chartService.filters()) ?? [])?.length ?? 0);
}
