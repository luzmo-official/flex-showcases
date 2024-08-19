import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartSettingsComponent } from './chart-settings/chart-settings.component';
import { SlotsDisplayComponent } from './slots-display/slots-display.component';
import { ChartPickerComponent } from './chart-picker/chart-picker.component';
import { AiChartInputComponent } from './ai-chart-input/ai-chart-input.component';

@Component({
  selector: 'app-chart-config-panel',
  standalone: true,
  imports: [JsonPipe, MatIconModule, ChartPickerComponent, ChartSettingsComponent, SlotsDisplayComponent, AiChartInputComponent, MatTooltipModule],
  templateUrl: './chart-config-panel.component.html',
  styleUrl: './chart-config-panel.component.scss'
})
export class ChartConfigPanelComponent {
  mode: string = 'slots';
  showAI = false;
  status = {
    generating: false,
    generated: false
  }

  setStatus(status: any) {
    this.status = status;
  }

  switchMode(mode: string) {
    this.mode = mode;
  }
}
