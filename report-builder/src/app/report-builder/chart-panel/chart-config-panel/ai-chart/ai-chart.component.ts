import { Component, DestroyRef, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../../shared/services/data.service';
import { ChartService } from '../../../shared/services/chart.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { CHARTS } from '../../../shared/constants/charts.constant';

@Component({
  selector: 'app-ai-chart',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './ai-chart.component.html',
  styleUrl: './ai-chart.component.scss'
})
export class AiChartComponent {
  private dataService = inject(DataService);
  private chartService = inject(ChartService);
  private readonly destroyRef = inject(DestroyRef);

  question!: string;

  generateChart() {
    this.dataService.generateChart(this.question, '30ee4df6-b311-4774-bbbd-3bdc52753f4a')
    .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((data) => {
          const slots = data?.generatedChart?.slots;
          const emptySlots = CHARTS().find((chart) => chart.type === data?.generatedChart?.type);
          if (emptySlots) {
            emptySlots.slots.forEach((slot) => {
              if (!slots.find((s) => s.name === slot.name)) {
                slots.push({ name: slot.name, content: [] });
              }
            });
          }
          const type = data?.generatedChart?.type;
          if (type) {
            this.chartService.updateType(type);
          }
          if (slots) {
            this.chartService.updateSlots(slots);
          }
        })
      )
      .subscribe();
  }
}
