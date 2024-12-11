import { Component, input, inject, DestroyRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DATASETS } from '../../shared/constants/datasets.constant';
import {
  ChartListItem,
  CreateBarChart,
  CreateNumberChart,
} from '../../shared/constants/charts.constant';
import { MetricSelectorComponent } from '../../shared/components/metric-selector/metric-selector.component';
import { NumberMetricsComponent } from '../../shared/components/number-metrics/number-metrics.component';

@Component({
  selector: 'app-country-stats-keeper',
  standalone: true,
  imports: [MetricSelectorComponent, NumberMetricsComponent],
  templateUrl: './country-stats-keeper.component.html',
  styleUrl: './country-stats-keeper.component.scss',
})
export class CountryStatsKeeperComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  smallScreen = true;
  country = input<string>();
  right = input<string>();

  numberMetrics = [
    CreateNumberChart('teams', 'cleanSheets', 'sum'),
    CreateNumberChart('teams', 'saves', 'sum'),
    CreateNumberChart('teams', 'goalsConceded', 'sum'),
  ];

  metrics: ChartListItem[] = [
    {
      key: 'saves',
      title: 'Saves',
      class: 'dim-6-3',
      chart: CreateBarChart('players', 'saves'),
    },
    {
      key: 'savesOnPenalty',
      title: 'Saves on penalty',
      class: 'dim-6-3',
      chart: CreateBarChart('players', 'savesOnPenalty'),
    },
    {
      key: 'cleanSheets',
      title: 'Clean sheets',
      class: 'dim-6-3',
      chart: CreateBarChart('players', 'cleanSheets'),
    },
    {
      key: 'goalsConceded',
      title: 'Goals conceded',
      class: 'dim-6-3',
      chart: CreateBarChart('players', 'goalsConceded'),
    },
  ];

  ngOnInit() {
    this.addKeeperFilters();
    this.breakpointObserver
      .observe(`(max-width: 1023px)`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.smallScreen = state.matches;
      });
  }

  addKeeperFilters(): void {
    for (const metric of this.metrics) {
      metric.chart.filters[0].filters.push({
        expression: '? in ?',
        parameters: [
          {
            dataset_id: DATASETS['players'].set,
            column_id: DATASETS['players'].columns['position'].column,
            level: 1,
          },
          ['GOALKEEPER'],
        ],
      });
    }
  }
}
