import { Component, inject, input, signal } from '@angular/core';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { LuzmoFlexChart } from '../luzmo-constants';
import { EmbedAuthService } from '../services/embed-auth.service';

@Component({
  selector: 'app-luzmo-chart',
  imports: [NgxLuzmoVizItemComponent],
  template: `
    <div class="chart-host" [style.height]="height()">
      <div class="chart-loader" [class.chart-loader--hidden]="!isLoading()">
        <span class="loader-text">&gt; RENDERING_DATA_</span><span class="loader-cursor">█</span>
      </div>
      <luzmo-viz-item
        class="chart-viz"
        [class.chart-viz--hidden]="isLoading()"
        [style.height]="height()"
        [authKey]="embedAuth.credentials().key"
        [authToken]="embedAuth.credentials().token"
        [options]="$any(chart().options)"
        [slots]="chart().slots"
        [type]="chart().type"
        [filters]="chart().filters ?? []"
        [appServer]="embedAuth.appServer"
        [apiHost]="embedAuth.apiUrl"
        (rendered)="onRendered()">
      </luzmo-viz-item>
    </div>
  `,
  styles: [`
    .chart-host {
      position: relative;
    }

    .chart-loader {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      opacity: 1;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    .chart-loader--hidden {
      opacity: 0;
    }

    .loader-text {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      color: var(--color-terminal-dark);
    }

    .loader-cursor {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-terminal-dark);
      animation: loader-blink 1s step-end infinite;
    }

    @keyframes loader-blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .chart-viz {
      opacity: 1;
      transition: opacity 0.4s ease;
    }

    .chart-viz--hidden {
      opacity: 0;
    }
  `],
})
export class LuzmoChartComponent {
  readonly chart = input.required<LuzmoFlexChart>();
  readonly height = input('350px');

  protected readonly embedAuth = inject(EmbedAuthService);

  isLoading = signal(true);

  onRendered(): void {
    this.isLoading.set(false);
  }
}
