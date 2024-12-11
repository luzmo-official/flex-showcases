import { Component, input, inject, DestroyRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChartListItem,
  CreateBarChart,
  CreatePlayersStackedBarChart,
  CreatePlayersDonutChart,
  CreateNumberChart,
} from '../../shared/constants/charts.constant';
import { MetricSelectorComponent } from '../../shared/components/metric-selector/metric-selector.component';
import { NumberMetricsComponent } from '../../shared/components/number-metrics/number-metrics.component';

@Component({
  selector: 'app-head-to-head-countries-offense',
  standalone: true,
  imports: [MetricSelectorComponent, NumberMetricsComponent],
  templateUrl: './head-to-head-countries-offense.component.html',
  styleUrl: './head-to-head-countries-offense.component.scss',
})
export class HeadToHeadCountriesOffenseComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  smallScreen = true;
  left = input<string>();
  right = input<string>();

  numberMetrics = [
    CreateNumberChart('teams', 'goals', 'sum'),
    CreateNumberChart('teams', 'goalsPerGame', undefined, 'Goals p.g.'),
    CreateNumberChart('teams', 'attemptsPerGame', undefined, 'Attempts p.g.'),
  ];

  metrics: ChartListItem[] = [
    {
      key: 'goals',
      title: 'Goals',
      class: 'dim-4-3',
      chart: CreatePlayersDonutChart('goals'),
    },
    {
      key: 'attempts',
      title: 'Attempts',
      class: 'dim-3-4',
      chart: CreateBarChart('players', 'attempts'),
    },
    {
      key: 'attemptAccuracy',
      title: 'Attempt Accuracy',
      class: 'dim-3-4',
      chart: CreatePlayersStackedBarChart(
        ['attemptsOnTarget', 'attemptsOffTarget', 'attemptsBlocked'],
        'sum',
        [],
        'attempts',
        { mode: '100', bars: { label: 'percentageCategory' } }
      ),
    },
    {
      key: 'assists',
      title: 'Assists',
      class: 'dim-1-1',
      chart: CreateBarChart('players', 'assists'),
    },
    {
      key: 'offsides',
      title: 'Offsides',
      class: 'dim-5-3',
      chart: CreateBarChart('players', 'offsides'),
    },
  ];

  ngOnInit() {
    this.breakpointObserver
      .observe(`(max-width: 1023px)`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.smallScreen = state.matches;
      });
  }
}
