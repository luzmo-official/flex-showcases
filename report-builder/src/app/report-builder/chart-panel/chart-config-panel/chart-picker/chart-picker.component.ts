import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { VizItemType, VizItemOptions } from '@luzmo/ngx-embed';
import { ChartService } from '../../../shared/services/chart.service';

type ChartDefinition = {
  type: VizItemType;
  name: string;
  icon: string;
  options?: VizItemOptions;
};

@Component({
    selector: 'app-chart-picker',
    imports: [MatIconModule, MatTooltipModule],
    templateUrl: './chart-picker.component.html',
    styleUrl: './chart-picker.component.scss'
})
export class ChartPickerComponent {
  readonly chartService = inject(ChartService);
  aiClick = output<boolean>();
  hideAI = input<boolean>();
  
  availableCharts: ChartDefinition[] = [
    {
      type: 'column-chart',
      name: 'Column Chart',
      icon: 'bar_chart',
    },
    {
      type: 'bar-chart',
      name: 'Bar Chart',
      icon: 'bar_chart',
    },
    {
      type: 'line-chart',
      name: 'Line Chart',
      icon: 'show_chart',
    },
    {
      type: 'area-chart',
      name: 'Area Chart',
      icon: 'area_chart',
    },
    {
      type: 'donut-chart',
      name: 'Donut Chart',
      icon: 'donut_small',
      options: { mode: 'donut' },
    },
    {
      type: 'donut-chart',
      name: 'Pie Chart',
      icon: 'pie_chart',
      options: { mode: 'pie' },
    },
    {
      type: 'bubble-chart',
      name: 'Bubble Chart',
      icon: 'bubble_chart',
    },
    {
      type: 'treemap-chart',
      name: 'Tree Map',
      icon: 'auto_awesome_mosaic',
    }
  ];

  async changeChart(chart: ChartDefinition): Promise<void> {
    this.chartService.updateName(chart.name);
    await this.chartService.updateType(chart.type);
    if (chart.options) {
      this.chartService.updateOptions({
        ...(chart.options ?? {}),
        display: {
          title: false,
        },
      });
    }
  }

  clickAIMode() {
    this.aiClick.emit(true);
  }
}
