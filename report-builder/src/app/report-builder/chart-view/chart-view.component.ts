import { Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxLuzmoDashboardModule } from '@luzmo/ngx-embed';
import { ChartService } from '../shared/services/chart.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-chart-view',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCheckboxModule, MatButtonToggleModule, NgxLuzmoDashboardModule],
  templateUrl: './chart-view.component.html',
  styleUrl: './chart-view.component.scss'
})
export class ChartViewComponent {
  chart = viewChild<ElementRef>('chart');
  readonly chartService = inject(ChartService);
  private readonly authService = inject(AuthService);

  authKey: string;
  authToken: string;
  chartIsEmpty = computed(() => !this.chartService.slots().some(slot => slot.content.length > 0));
  tableOptions = { display: { title: false }
  };

  switchDataSummarization(summarizedData: boolean) {
    this.chartService.setTableType(summarizedData ? 'pivot-table' : 'regular-table');
  }

  constructor() {
    const auth = this.authService.getAuth();
    this.authKey = auth.authKey;
    this.authToken = auth.authToken;
  }

  undo() {
    this.chartService.undo();
  }

  redo() {
    this.chartService.redo();
  }

  export() {
    (this.chart() as any)?.export('png');
  }
}
