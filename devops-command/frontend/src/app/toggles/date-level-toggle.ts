import { Component, inject, input } from '@angular/core';
import { ChartStateService, DateLevelChartKey, DateLevel } from '../services/chart-state.service';

@Component({
  selector: 'app-date-level-toggle',
  template: `
    <div class="btn-group-terminal">
      <button
        [class.active]="chartState.isLevel(chartKey(), 2)"
        (click)="chartState.setDateLevel(chartKey(), 2)"
      >Q</button>
      <button
        [class.active]="chartState.isLevel(chartKey(), 3)"
        (click)="chartState.setDateLevel(chartKey(), 3)"
      >M</button>
      <button
        [class.active]="chartState.isLevel(chartKey(), 4)"
        (click)="chartState.setDateLevel(chartKey(), 4)"
      >W</button>
    </div>
  `,
})
export class DateLevelToggleComponent {
  readonly chartKey = input.required<DateLevelChartKey>();

  protected readonly chartState = inject(ChartStateService);
}
