import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { ChartService } from '../../shared/services/chart.service';

import '@luzmo/analytics-components-kit/filters';

@Component({
    selector: 'app-filters-panel',
    imports: [],
    templateUrl: './filters-panel.component.html',
    styleUrl: './filters-panel.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FiltersPanelComponent implements AfterViewInit {
  @ViewChild('luzmoFilters', { read: ElementRef }) luzmoFiltersRef!: ElementRef;

  @Input({ required: true }) authKey!: string;
  @Input({ required: true }) authToken!: string;
  @Input({ required: true }) datasetIds!: string[];

  readonly chartService = inject(ChartService);

  ngAfterViewInit() {
    if (this.luzmoFiltersRef?.nativeElement) {
      this.luzmoFiltersRef.nativeElement['addEventListener']('luzmo-filters-changed', (event: Event) => {
        this.onFiltersChanged(event);
      });
    }
  }

  onFiltersChanged(event: Event) {
    const detail = (event as CustomEvent<{ filters: any[] }>).detail;
    this.chartService.updateFilters(detail?.filters ?? []);
  }
}
