import { Component, inject, input } from '@angular/core';
import { ChartStateService, SquadFilterChartKey } from '../services/chart-state.service';

@Component({
  selector: 'app-squad-filter-toggle',
  template: `
    <div class="btn-group-terminal">
      <button
        [class.active]="chartState.isSquadActive('Forge', chartKey())"
        (click)="chartState.toggleSquad('Forge', chartKey())"
      >FORGE</button>
      <button
        [class.active]="chartState.isSquadActive('Orbit', chartKey())"
        (click)="chartState.toggleSquad('Orbit', chartKey())"
      >ORBIT</button>
      <button
        [class.active]="chartState.isSquadActive('Horizon', chartKey())"
        (click)="chartState.toggleSquad('Horizon', chartKey())"
      >HORIZON</button>
    </div>
  `,
})
export class SquadFilterToggleComponent {
  readonly chartKey = input.required<SquadFilterChartKey>();

  protected readonly chartState = inject(ChartStateService);
}