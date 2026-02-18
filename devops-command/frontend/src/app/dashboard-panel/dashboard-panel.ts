import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-panel',
  templateUrl: './dashboard-panel.html',
})
export class DashboardPanelComponent {
  readonly title = input<string | undefined>('');
}
