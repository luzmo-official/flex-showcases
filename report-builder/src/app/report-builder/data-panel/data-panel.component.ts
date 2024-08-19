import { Component, computed, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import {
  CdkDragPreview,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { DataService } from '../shared/services/data.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatOption,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import { CHARTS, COLUMN_TYPE_ICONS } from '../shared/constants/charts.constant';
import { ChartService } from '../shared/services/chart.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Column = {
  name: { en: string };
  type: string;
  securable_id: string;
};

type Dataset = {
  name: string;
  datasetId: string;
};

@Component({
  selector: 'app-data-panel',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkAccordionModule,
    CdkDragPreview,
    CdkDragPlaceholder,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButton,
    MatProgressSpinner,
    ReactiveFormsModule,
    MatIconButton,
    MatSelect,
    MatOption,
    MatSelectTrigger,
  ],
  templateUrl: './data-panel.component.html',
  styleUrl: './data-panel.component.scss',
})
export class DataPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  datasets = [
    {
      name: 'Sales (Primary)',
      datasetId: '70902e57-8c32-4890-a728-650c686c1f5d',
    },
    {
      name: 'Logistic',
      datasetId: 'e037cf59-4913-4221-a188-364ebdb42062',
    },
  ] satisfies Dataset[];

  /*datasets = [
    {
      name: 'Team Stats',
      datasetId: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
    },
    {
      name: 'Player Stats',
      datasetId: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
    }
  ] satisfies Dataset[];*/

  panelOpenState = false;
  collapsed = false;
  columnTypeIcons = COLUMN_TYPE_ICONS;

  availableColumns: Column[] = [];
  filteredColumns: Column[] = [];
  cdkDropLists: string[] = [];
  isLoading = false;

  selectedDataset = new FormControl(this.datasets[0]);
  selectedDatasets = new FormControl([...this.datasets]);

  searchControl = new FormControl('');
  hasSearchTerm = false;

  private readonly dataService = inject(DataService);
  private readonly chartService = inject(ChartService);

  constructor() {
    effect(() => {
      // Update names of CDK drop fields, based on slot names
      this.cdkDropLists = CHARTS().find((chart) => chart.type === this.chartService.type())?.slots?.map((slot) => `data-drop-${slot.name}`) ?? [];
      this.cdkDropLists.push('data-drop-filter');
    });
  }

  ngOnInit() {
    this.updateColumnList([this.selectedDataset.value.datasetId]);

    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchTerm) => {
        const hasSearchTerm = !!searchTerm && searchTerm?.trim() !== '';
        if (hasSearchTerm !== this.hasSearchTerm) {
          if (hasSearchTerm) {
            this.selectedDatasets.setValue(this.datasets);
          } else {
            this.selectedDataset.setValue(this.datasets[0]);
          }
        }
        this.hasSearchTerm = !!searchTerm && searchTerm?.trim() !== '';
        this.applyFilter(searchTerm);
      });

    this.selectedDataset.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dataset) => {
        this.updateColumnList([dataset.datasetId]);
      });

    this.selectedDatasets.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((datasets) => {
        this.updateColumnList(datasets.map((dataset) => dataset.datasetId));
      });
  }

  clearSearchInput() {
    this.searchControl.setValue('');
  }

  private updateColumnList(datasetIds: string[]) {
    this.isLoading = true;
    this.dataService
      .getDatasetColumns(datasetIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        result.sort((a, b) => a.name.en.localeCompare(b.name.en));
        this.availableColumns = result;
        this.applyFilter(this.searchControl.value);
        this.isLoading = false;
      });
  }

  private applyFilter(searchTerm: string) {
    if (searchTerm) {
      this.filteredColumns = this.availableColumns.filter((item) =>
        this.selectedDataset.value.datasetId === item.securable_id &&
        item.name.en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.filteredColumns = this.availableColumns;
    }
  }
}
