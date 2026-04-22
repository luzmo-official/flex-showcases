import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChartService } from '../../shared/services/chart.service';
import { ChartPickerComponent } from './chart-picker/chart-picker.component';
import { AiChartInputComponent } from './ai-chart-input/ai-chart-input.component';
import { SlotsDisplayComponent } from './slots-display/slots-display.component';

@Component({
    selector: 'app-chart-config-panel',
    imports: [MatIconModule, ChartPickerComponent, AiChartInputComponent, SlotsDisplayComponent],
    templateUrl: './chart-config-panel.component.html',
    styleUrl: './chart-config-panel.component.scss'
})
export class ChartConfigPanelComponent {
  @Input({ required: true }) authKey!: string;
  @Input({ required: true }) authToken!: string;

  readonly chartService = inject(ChartService);

  showAI = false;
  aiStatus = {
    generating: false,
    generated: false,
    error: false,
    errorMessage: ''
  };

  setAIStatus(status: any) {
    this.aiStatus = status;
  }

  onSlotsChanged(event: Event) {
    const detail = (event as CustomEvent<{ slotsContents: any[] }>).detail;
    this.chartService.updateSlots(detail?.slotsContents ?? []);
  }
}

