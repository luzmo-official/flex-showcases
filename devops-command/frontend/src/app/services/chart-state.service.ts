import { Injectable, signal, WritableSignal } from '@angular/core';
import {
  BUGS_DELTA_CHART,
  OPEN_CLIENT_BUGS_EVOLUTION,
  CREATED_CLIENT_BUGS,
  OPEN_CLIENT_BUGS_LIST,
  PRS_MERGED_BY_SQUAD,
  PRS_PER_REPO,
  LuzmoFlexChart,
  BUG_TICKETS_DATE_COLUMN_ID,
  BUG_TICKETS_SQUAD_COLUMN_ID,
  BUG_TICKETS_SQUAD_DATASET_ID,
  BUG_EVOLUTION_SQUAD_COLUMN_ID,
  JIRA_BUGS_DATASET_ID,
  Squad,
  PrLevel,
  PR_LEVEL_SQUAD_CONTENT,
  PR_LEVEL_USER_CONTENT,
  PR_LEVEL_REPO_CONTENT
} from '../luzmo-constants';

export type DateLevelChartKey = 'bugsDelta' | 'openBugsEvolution' | 'createdBugs';
export type DateLevel = 2 | 3 | 4; // 2 = Quarter, 3 = Month, 4 = Week
export type SquadFilterChartKey = 'openBugsList' | 'openBugsEvolution';

@Injectable({ providedIn: 'root' })
export class ChartStateService {
  readonly allSquads: Squad[] = ['Forge', 'Orbit', 'Horizon'];

  // Chart configurations (signals for reactivity)
  readonly bugsDeltaChart: WritableSignal<LuzmoFlexChart> = signal(structuredClone(BUGS_DELTA_CHART));
  readonly openBugsEvolutionChart: WritableSignal<LuzmoFlexChart> = signal(structuredClone(OPEN_CLIENT_BUGS_EVOLUTION));
  readonly createdBugsChart: WritableSignal<LuzmoFlexChart> = signal(structuredClone(CREATED_CLIENT_BUGS));
  readonly openBugsListChart: WritableSignal<LuzmoFlexChart> = signal(structuredClone(OPEN_CLIENT_BUGS_LIST));
  readonly prsMergedBySquadChart: WritableSignal<LuzmoFlexChart> = signal(structuredClone(PRS_MERGED_BY_SQUAD));
  readonly prsPerRepoChart: LuzmoFlexChart = PRS_PER_REPO;

  // Generated charts from IQ responses
  readonly generatedCharts = signal<LuzmoFlexChart[]>([]);

  // Track active squad filters per chart
  readonly activeSquads: Record<SquadFilterChartKey, WritableSignal<Set<Squad>>> = {
    openBugsList: signal(new Set(this.allSquads)),
    openBugsEvolution: signal(new Set(this.allSquads)),
  };

  // Track active PR levels for sunburst chart
  readonly activePrLevels = signal<Set<PrLevel>>(new Set(['SQUAD', 'USER']));

  // Track current date levels for each chart
  readonly dateLevels: Record<DateLevelChartKey, WritableSignal<DateLevel>> = {
    bugsDelta: signal<DateLevel>(2),
    openBugsEvolution: signal<DateLevel>(4),
    createdBugs: signal<DateLevel>(4)
  };

  // Map squad filter chart keys to their signals
  private readonly squadFilterChartSignals: Record<SquadFilterChartKey, WritableSignal<LuzmoFlexChart>> = {
    openBugsList: this.openBugsListChart,
    openBugsEvolution: this.openBugsEvolutionChart,
  };

  // Column/dataset IDs used when building squad filters per chart
  private readonly squadFilterParams: Record<SquadFilterChartKey, { columnId: string; datasetId: string }> = {
    openBugsList: { columnId: BUG_TICKETS_SQUAD_COLUMN_ID, datasetId: BUG_TICKETS_SQUAD_DATASET_ID },
    openBugsEvolution: { columnId: BUG_EVOLUTION_SQUAD_COLUMN_ID, datasetId: JIRA_BUGS_DATASET_ID },
  };

  // Map chart keys to their signals
  private readonly chartSignals: Record<DateLevelChartKey, WritableSignal<LuzmoFlexChart>> = {
    bugsDelta: this.bugsDeltaChart,
    openBugsEvolution: this.openBugsEvolutionChart,
    createdBugs: this.createdBugsChart
  };

  /**
   * Set the date level for a specific chart
   * @param chartKey - The chart identifier
   * @param level - The date level (2 = Quarter, 3 = Month, 4 = Week)
   */
  setDateLevel(chartKey: DateLevelChartKey, level: DateLevel): void {
    const chartSignal = this.chartSignals[chartKey];
    const currentChart = chartSignal();

    // Deep clone to trigger change detection
    const updatedChart = structuredClone(currentChart);

    // Find the x-axis slot and update the level
    const xAxisSlot = updatedChart.slots.find(slot => slot.name === 'x-axis');
    if (xAxisSlot?.content) {
      const dateContent = xAxisSlot.content.find(
        (c: any) => c.column === BUG_TICKETS_DATE_COLUMN_ID || c.columnId === BUG_TICKETS_DATE_COLUMN_ID
      );
      if (dateContent) {
        (dateContent as any).level = level;
      }
    }

    chartSignal.set(updatedChart);
    this.dateLevels[chartKey].set(level);
  }

  /**
   * Check if a chart is currently set to a specific date level
   */
  isLevel(chartKey: DateLevelChartKey, level: DateLevel): boolean {
    return this.dateLevels[chartKey]() === level;
  }

  /**
   * Toggle a squad filter on/off for the given chart
   * @param squad - The squad to toggle
   * @param chartKey - The chart to apply the filter to
   */
  toggleSquad(squad: Squad, chartKey: SquadFilterChartKey): void {
    const activeSquadsSignal = this.activeSquads[chartKey];
    const current = new Set(activeSquadsSignal());

    if (current.has(squad)) {
      // Prevent deselecting all squads - at least one must remain active
      if (current.size > 1) {
        current.delete(squad);
      }
    } else {
      current.add(squad);
    }

    activeSquadsSignal.set(current);

    const selectedSquads = this.allSquads.filter(activeSquad => current.has(activeSquad));
    const hasAllSquadsSelected = selectedSquads.length === this.allSquads.length;

    const chartSignal = this.squadFilterChartSignals[chartKey];
    const { columnId, datasetId } = this.squadFilterParams[chartKey];
    const chart = structuredClone(chartSignal());
    if (hasAllSquadsSelected) {
      delete (chart as any).filters;
    } else {
      chart.filters = [
        {
          condition: 'and',
          filters: [
            {
              expression: '? in ?',
              parameters: [
                {
                  column_id: columnId,
                  dataset_id: datasetId,
                  level: 1
                },
                selectedSquads
              ]
            }
          ]
        } as any
      ];
    }
    chartSignal.set(chart);
  }

  /**
   * Check if a squad is currently active in the filter for the given chart
   */
  isSquadActive(squad: Squad, chartKey: SquadFilterChartKey): boolean {
    return this.activeSquads[chartKey]().has(squad);
  }

  /**
   * Toggle a PR level on/off for the sunburst chart
   * @param level - The level to toggle (SQUAD, USER, or REPO)
   */
  togglePrLevel(level: PrLevel): void {
    const current = new Set(this.activePrLevels());

    if (current.has(level)) {
      // Prevent removing all levels - at least one must remain active
      if (current.size > 1) {
        current.delete(level);
      }
    } else {
      current.add(level);
    }

    this.activePrLevels.set(current);

    // Rebuild levels slot content based on active levels
    const chart = structuredClone(this.prsMergedBySquadChart());
    const levelsSlot = chart.slots.find(s => s.name === 'levels');
    if (levelsSlot) {
      const newContent: any[] = [];
      if (current.has('SQUAD')) newContent.push(structuredClone(PR_LEVEL_SQUAD_CONTENT));
      if (current.has('USER')) newContent.push(structuredClone(PR_LEVEL_USER_CONTENT));
      if (current.has('REPO')) newContent.push(structuredClone(PR_LEVEL_REPO_CONTENT));
      levelsSlot.content = newContent;
    }
    this.prsMergedBySquadChart.set(chart);
  }

  /**
   * Check if a PR level is currently active
   */
  isPrLevelActive(level: PrLevel): boolean {
    return this.activePrLevels().has(level);
  }

  /**
   * Add a generated chart from IQ response
   */
  addGeneratedChart(chart: LuzmoFlexChart): void {
    this.generatedCharts.update(charts => [...charts, chart]);
    console.log('Generated chart:', chart);
  }
}
