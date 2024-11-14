import { Component, DestroyRef, inject, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataService } from '../../../shared/services/data.service';
import { ChartService } from '../../../shared/services/chart.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { CHARTS } from '../../../shared/constants/charts.constant';
import { SlotsDisplayComponent } from '../slots-display/slots-display.component';
import { ChartPickerComponent } from '../chart-picker/chart-picker.component';
import { ItemType } from '@luzmo/ngx-embed';
import { Slot } from 'src/app/shared/models/slots';

@Component({
  selector: 'app-ai-chart',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatProgressBarModule, SlotsDisplayComponent, ChartPickerComponent],
  templateUrl: './ai-chart-input.component.html',
  styleUrl: './ai-chart-input.component.scss'
})
export class AiChartInputComponent {
  private dataService = inject(DataService);
  private chartService = inject(ChartService);
  private readonly destroyRef = inject(DestroyRef);
  status = output<any>();

  question!: string;
  chartType!: ItemType;
  slots: any = [];
  _status = {
    generating: false,
    generated: false
  }

  generateChart() {
    this._status.generating = true;
    this.status.emit(this._status);
    this.dataService.generateChart(this.question)
    .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((data) => {
          const slots = data?.generatedChart?.slots;
          for (const slot of slots) {
            for (const content of slot.content) {
              if (typeof content.label === 'string') {
                content.label = { en: content.label };
              }
            }
          }
          const generatedChartDef = CHARTS().find((chart) => chart.type === data?.generatedChart?.type);
          if (generatedChartDef) {
            generatedChartDef.slots.forEach((slot) => {
              const slotFound = slots.find((s: Slot) => s.name === slot.name);
              if (slotFound) {
                slotFound.label = slot?.label;
                slotFound.type = slot?.type;
                slotFound.canAcceptMultipleColumns = slot?.canAcceptMultipleColumns;
              }
              else {
                slots.push(slot);
              }
            });
          }

          this.chartType = data?.generatedChart?.type;
          this.slots = slots ?? [];

          const type = data?.generatedChart?.type;
          if (type) {
            const chartName = CHARTS().find((chart) => chart.type === type)?.name ?? 'Column chart';
            this.chartService.updateType(this.chartType);
            this.chartService.updateName(chartName);
          }
          if (slots) {
            this.chartService.updateSlots(this.slots);
          }
          this._status.generating = false;
          this._status.generated = true;
          this.status.emit(this._status);
        })
      )
      .subscribe();
  }
}
