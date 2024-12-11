import { Component, input, inject, DestroyRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CreateBarChart,
  CreatePlayersTreemapChart,
  CreatePlayersBubbleChart,
  CreateNumberChart,
  CreatePlayersStackedBarChart,
  ChartListItem,
  CreateFunnelProbabilityChart,
} from '../../shared/constants/charts.constant';
import { MetricSelectorComponent } from '../../shared/components/metric-selector/metric-selector.component';
import { NumberMetricsComponent } from '../../shared/components/number-metrics/number-metrics.component';

@Component({
  selector: 'app-country-stats-team',
  standalone: true,
  imports: [MetricSelectorComponent, NumberMetricsComponent],
  templateUrl: './country-stats-team.component.html',
  styleUrl: './country-stats-team.component.scss',
})
export class CountryStatsTeamComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  smallScreen = true;
  country = input<string>();
  right = input<string>();

  numberMetrics = [
    CreateNumberChart('teams', 'wins', 'sum'),
    CreateNumberChart('teams', 'losses', 'sum'),
    CreateNumberChart('teams', 'draws', 'sum'),
    /*CreateNumberChart('teams', 'goals', 'sum'),
    CreateNumberChart('teams', 'passAccuracy', 'average'),
    CreateNumberChart('teams', 'ballPossession', 'average')*/
  ];

  metrics: ChartListItem[] = [
    {
      key: 'probability',
      title: 'Win probability',
      class: 'dim-1-1',
      chart: CreateFunnelProbabilityChart(),
    },
    {
      key: 'goals',
      title: 'Goals',
      class: 'dim-1-1',
      chart: CreatePlayersBubbleChart('goals'),
    },
    {
      key: 'matchesAppearances',
      title: 'Matches appearances',
      class: 'dim-3-5',
      chart: CreateBarChart('players', 'matchesAppearances'),
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
      chart: CreatePlayersTreemapChart('assists', 'sum', 'Assists', {
        display: { values: 'percentage' },
      }),
    },
    {
      key: 'cards',
      title: 'Cards',
      class: 'dim-4-3',
      chart: CreatePlayersStackedBarChart(
        ['yellowCards', 'redCards'],
        'sum',
        [],
        'cards'
      ),
    },
    {
      key: 'corners',
      title: 'Corners',
      class: 'dim-4-3',
      chart: CreateBarChart('players', 'corners'),
    },
    {
      key: 'offsides',
      title: 'Offsides',
      class: 'dim-5-3',
      chart: CreateBarChart('players', 'offsides'),
    },
    {
      key: 'freeKick',
      title: 'Free kicks',
      class: 'dim-1-1',
      chart: CreatePlayersBubbleChart('freeKick', 'sum', 'Free kicks', {
        display: { bubbleValues: 'percentage' },
      }),
    },
    {
      key: 'height',
      title: 'Height',
      class: 'dim-3-4',
      chart: CreateBarChart('players', 'height'),
    },
    {
      key: 'weight',
      title: 'Weight',
      class: 'dim-3-4',
      chart: CreateBarChart('players', 'weight'),
    },
  ];

  ngOnInit(): void {
    this.breakpointObserver
      .observe(`(max-width: 1023px)`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.smallScreen = state.matches;
      });
  }
}
