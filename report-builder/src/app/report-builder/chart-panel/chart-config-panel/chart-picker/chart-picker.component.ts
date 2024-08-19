import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CHARTS } from '../../../shared/constants/charts.constant';
import { Chart } from '../../../shared/models/models';
import { ChartService } from '../../../shared/services/chart.service';

@Component({
  selector: 'app-chart-picker',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './chart-picker.component.html',
  styleUrl: './chart-picker.component.scss'
})
export class ChartPickerComponent {
  readonly chartService = inject(ChartService);
  aiClick = output<boolean>();
  hideAI = input<boolean>();
  availableCharts = CHARTS();

  changeChart(chart: Chart): void {
    this.chartService.updateName(chart.name);
    this.chartService.updateType(chart.type);
  }

  clickAIMode() {
    this.aiClick.emit(true);
  }
}
