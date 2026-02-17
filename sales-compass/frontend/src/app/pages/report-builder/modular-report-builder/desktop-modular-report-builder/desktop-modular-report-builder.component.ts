import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, viewChild } from '@angular/core';
import { EditFiltersFilterGroup } from '@luzmo/analytics-components-kit/utils';
import '@luzmo/analytics-components-kit/draggable-data-fields-panel';
import '@luzmo/analytics-components-kit/item-data-drop-panel';
import '@luzmo/analytics-components-kit/grid';
import '@luzmo/analytics-components-kit/edit-item';
import '@luzmo/analytics-components-kit/edit-filters';
import '@luzmo/lucero/action-button';
import '@luzmo/lucero/button';
import '@luzmo/lucero/button-group';
import '@luzmo/lucero/icon';
import '@luzmo/lucero/progress-circle';
import '@luzmo/lucero/tabs';
import '@luzmo/lucero/text-field';
import { Slot, VizItemOptions } from '@luzmo/dashboard-contents-types';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';

import { environment } from '../../../../../environments/environment';
import { DATASET_ID } from '../../../../constants/luzmo-constants';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { DeepPartial } from '../../../../types';
import { getChartIcon, getChartLabel } from '../modular-report-builder-helper';
import { ReportBuilderStateService } from '../modular-report-builder-state.service';

type TabsElement = EventTarget & { selected?: string | null };
type TabsChangeEvent = Event & { target: TabsElement | null };

@Component({
  selector: 'app-desktop-modular-report-builder',
  imports: [CommonModule, TranslatePipe, NgxLuzmoVizItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './desktop-modular-report-builder.component.html',
  styleUrls: ['./desktop-modular-report-builder.component.scss'],
  host: {
    class: 'block h-full'
  }
})
export class DesktopModularReportBuilderComponent implements AfterViewInit {
  state = inject(ReportBuilderStateService);

  readonly luzmoGrid = viewChild<ElementRef<HTMLElement>>('luzmoGrid');

  environment = environment;
  datasetIds = [DATASET_ID];

  // Panel state for options/filters side panel
  activeConfigPanel: 'options' | 'filters' | null = null;

  // Expose helper functions
  getChartIcon = getChartIcon;
  getChartLabel = getChartLabel;

  ngAfterViewInit(): void {
    const grid = this.luzmoGrid();

    if (grid) {
      this.state.setGridElement(grid);
    }
  }

  onTabChange(event: TabsChangeEvent): void {
    const selectedValue = event.target?.selected ?? null;

    if (
      selectedValue &&
      (selectedValue === 'chart-builder' || selectedValue === 'ai-description' || selectedValue === 'popular-insights')
    ) {
      this.state.changeMode(selectedValue);
      // Close panel when switching modes
      this.activeConfigPanel = null;
    }
  }

  onSlotsContentsChanged(event: CustomEvent<{ slotsContents: Slot[] }>): void {
    this.state.activeChartSlotContents.set(event.detail.slotsContents);
  }

  onDatasetChanged(event: CustomEvent<{ datasetId: string }>): void {
    this.state.onDatasetChanged(event.detail.datasetId);
  }

  // Panel toggle methods
  toggleOptionsPanel(): void {
    this.activeConfigPanel = this.activeConfigPanel === 'options' ? null : 'options';
  }

  toggleFiltersPanel(): void {
    this.activeConfigPanel = this.activeConfigPanel === 'filters' ? null : 'filters';
  }

  closePanel(): void {
    this.activeConfigPanel = null;
  }

  // Event handlers for options and filters changes
  onChartOptionsChanged(event: CustomEvent<{ options: DeepPartial<VizItemOptions> }>): void {
    this.state.onChartOptionsChanged(event.detail.options);
  }

  onChartFiltersChanged(event: CustomEvent<{ filters: EditFiltersFilterGroup | null }>): void {
    this.state.onChartFiltersChanged(event.detail.filters ?? null);
  }
}
