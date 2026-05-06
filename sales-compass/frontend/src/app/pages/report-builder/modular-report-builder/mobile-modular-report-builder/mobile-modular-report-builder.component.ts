import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, effect, inject, viewChild } from '@angular/core';
import { Slot } from '@luzmo/dashboard-contents-types';
import '@luzmo/lucero/action-button';
import '@luzmo/lucero/button';
import '@luzmo/lucero/icon';
import '@luzmo/lucero/progress-circle';
import '@luzmo/lucero/tabs';
import '@luzmo/lucero/text-field';
import '@luzmo/analytics-components-kit/grid';
import '@luzmo/analytics-components-kit/item-data-picker-panel';
import '@luzmo/analytics-components-kit/edit-item';
import '@luzmo/analytics-components-kit/edit-filters';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';

import { environment } from '../../../../../environments/environment';
import { DATASET_ID } from '../../../../constants/luzmo-constants';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { LuzmoFlexChart } from '../../../../types';
import { getChartIcon, getChartLabel } from '../modular-report-builder-helper';
import { ReportBuilderStateService } from '../modular-report-builder-state.service';

@Component({
  selector: 'app-mobile-modular-report-builder',
  imports: [CommonModule, TranslatePipe, NgxLuzmoVizItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mobile-modular-report-builder.component.html',
  host: {
    class: 'block h-full'
  }
})
export class MobileModularReportBuilderComponent {
  state = inject(ReportBuilderStateService);

  readonly luzmoGrid = viewChild<ElementRef<HTMLElement>>('luzmoGrid');

  environment = environment;
  mobileActiveTab: 'build' | 'dashboard' = 'build';
  chartConfigTab: 'data' | 'options' | 'filters' = 'data';
  datasetIds = [DATASET_ID];

  // Expose helper functions
  getChartIcon = getChartIcon;
  getChartLabel = getChartLabel;

  constructor() {
    // Keep the state service in sync with the currently rendered grid element.
    // On mobile the grid is mounted/unmounted when switching tabs.
    effect(() => {
      const grid = this.luzmoGrid();

      if (grid) {
        this.state.setGridElement(grid);
      } else {
        this.state.clearGridElement();
      }
    });
  }

  changeMobileTab(tab: 'build' | 'dashboard'): void {
    this.mobileActiveTab = tab;
  }

  addInsightAndGoToDashboard(chart: LuzmoFlexChart): void {
    // Queue if the grid isn't available yet; the state service will flush once the grid is mounted.
    this.state.addInsightToDashboard(chart);
    this.changeMobileTab('dashboard');
  }

  onMobileTabChange(event: any): void {
    const selectedValue = event.target.selected;

    if (selectedValue) {
      this.changeMobileTab(selectedValue as 'build' | 'dashboard');
    }
  }

  onSlotsContentsChanged(event: CustomEvent<{ slotsContents: Slot[] }>): void {
    this.state.activeChartSlotContents.set(event.detail.slotsContents);
  }

  onChartConfigTabChange(event: any): void {
    const selectedValue = event.target.selected;

    if (selectedValue) {
      this.chartConfigTab = selectedValue as 'data' | 'options' | 'filters';
    }
  }

  onChartOptionsChanged(event: CustomEvent<{ options: any }>): void {
    this.state.onChartOptionsChanged(event.detail.options);
  }

  onChartFiltersChanged(event: CustomEvent<{ filters: any }>): void {
    this.state.onChartFiltersChanged(event.detail.filters ?? null);
  }
}
