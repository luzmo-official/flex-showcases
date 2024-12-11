import { Component, input, inject, DestroyRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChartListItem,
  CreateBarChart,
  CreateNumberChart,
} from '../../shared/constants/charts.constant';
import { MetricSelectorComponent } from '../../shared/components/metric-selector/metric-selector.component';
import { NumberMetricsComponent } from '../../shared/components/number-metrics/number-metrics.component';

@Component({
  selector: 'app-head-to-head-countries-defense',
  standalone: true,
  imports: [MetricSelectorComponent, NumberMetricsComponent],
  templateUrl: './head-to-head-countries-defense.component.html',
  styleUrl: './head-to-head-countries-defense.component.scss',
})
export class HeadToHeadCountriesDefenseComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  smallScreen = true;
  left = input<string>();
  right = input<string>();

  numberMetrics = [
    CreateNumberChart('teams', 'recoveredBalls', 'sum'),
    CreateNumberChart('teams', 'tackles', 'sum'),
    CreateNumberChart(
      'teams',
      'goalsConcededPerGame',
      undefined,
      'Goals conceded p.g.'
    ),
  ];

  metrics: ChartListItem[] = [
    {
      key: 'recoveredBalls',
      title: 'Recovered balls',
      class: 'dim-3-4',
      chart: CreateBarChart('players', 'recoveredBalls'),
    },
    {
      key: 'tackles',
      title: 'Tackles',
      class: 'dim-3-4',
      chart: CreateBarChart('players', 'tackles'),
    },
    {
      key: 'foulsCommitted',
      title: 'Fouls committed',
      class: 'dim-3-4',
      chart: CreateBarChart('players', 'foulsCommitted'),
    },
    {
      key: 'clearanceAttempted',
      title: 'Clearance attempted',
      class: 'dim-3-4',
      chart: CreateBarChart('players', 'clearanceAttempted'),
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
