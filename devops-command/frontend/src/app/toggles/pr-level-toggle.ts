import { Component, inject } from '@angular/core';
import { ChartStateService } from '../services/chart-state.service';
import { PrLevel } from '../luzmo-constants';

@Component({
  selector: 'app-pr-level-toggle',
  template: `
    <div class="btn-group-terminal">
      <button
        [class.active]="chartState.isPrLevelActive('SQUAD')"
        (click)="chartState.togglePrLevel('SQUAD')"
      >SQUAD</button>
      <button
        [class.active]="chartState.isPrLevelActive('USER')"
        (click)="chartState.togglePrLevel('USER')"
      >USER</button>
      <button
        [class.active]="chartState.isPrLevelActive('REPO')"
        (click)="chartState.togglePrLevel('REPO')"
      >REPO</button>
    </div>
  `,
})
export class PrLevelToggleComponent {
  protected readonly chartState = inject(ChartStateService);
}
