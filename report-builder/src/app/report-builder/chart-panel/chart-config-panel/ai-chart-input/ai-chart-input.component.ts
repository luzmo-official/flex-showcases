import { Component, inject, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataService } from '../../../shared/services/data.service';
import { ChartService } from '../../../shared/services/chart.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { VizItemType } from '@luzmo/ngx-embed';
import { VizItemSlot } from '@luzmo/dashboard-contents-types';

@Component({
    selector: 'app-ai-chart',
    imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatProgressBarModule],
    templateUrl: './ai-chart-input.component.html',
    styleUrl: './ai-chart-input.component.scss'
})
export class AiChartInputComponent {
  private dataService = inject(DataService);
  private chartService = inject(ChartService);
  status = output<any>();

  question!: string;
  chartType!: VizItemType;
  slots: VizItemSlot[] = [];
  _status = {
    generating: false,
    generated: false,
    error: false,
    errorMessage: ''
  }

  async generateChart() {
    this._status = { generating: true, generated: false, error: false, errorMessage: '' };
    this.status.emit(this._status);
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const data = await firstValueFrom(this.dataService.generateChart(this.question));
        
        const chartType = data?.generatedChart?.type;
        const slots = data?.generatedChart?.slots;
        
        if (!chartType || !slots?.length) {
          throw new Error('Invalid chart data received');
        }
        
        this.chartType = chartType;
        this.slots = slots;
        
        await this.chartService.updateType(chartType);
        const chartName = chartType.charAt(0).toUpperCase() + chartType.slice(1).replace(/[-_]/g, ' ');
        this.chartService.updateName(chartName);
        await this.chartService.updateSlots(slots);
        
        this._status = { generating: false, generated: true, error: false, errorMessage: '' };
        this.status.emit(this._status);
        return;
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === 2) {
          this._status = { generating: false, generated: false, error: true, errorMessage: 'An unexpected error occurred, please try again later' };
          this.status.emit(this._status);
        }
      }
    }
  }
}
