import { computed, Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { CHARTS } from '../constants/charts.constant';
import { Chart } from '../models/models';
import { FilterSlot, Value } from "../../chart-panel/filters-panel/filters-panel.component";
import { Slot } from 'src/app/shared/models/slots';

type ChartState = {
  name: Chart['name'];
  type: Chart['type'];
  options: Chart['settings'];
  slots: Chart['slots'];
  filters: FilterSlot[];
  filterOperator: 'and' | 'or';
  icon: Chart['icon'];
  tableType: 'regular-table' | 'pivot-table';
  tableSlots: Pick<Slot, 'name' | 'content'>[];
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private state = signalState<ChartState>({
    name: 'Column Chart',
    type: 'column-chart',
    options: {},
    slots: CHARTS().find(chart => chart.type === 'column-chart')?.slots ?? [],
    filters: [],
    filterOperator: 'and',
    icon: 'bar_chart',
    tableType: 'regular-table',
    tableSlots: [{ name: 'columns', content: [] }]
  });

  name = this.state.name;
  type = this.state.type;
  options = this.state.options;
  slots = this.state.slots;
  filters = this.state.filters;
  filterOperator = this.state.filterOperator;
  filtersForFlexChart = computed(() => {
    return this.transformToFlexFilters();
  });
  icon = this.state.icon
  tableType = this.state.tableType;
  tableSlots = this.state.tableSlots;

  updateName(name: Chart['name']): void {
    patchState(this.state, { name });
  }

  updateType(type: Chart['type']): void {
    patchState(this.state, { type });

    // Map slots between chart types (category -> category, measure -> measure, ...)
    const oldSlots = [...this.slots()];
    const newSlots = (CHARTS().find(chart => chart.type === this.type())?.slots ?? []).map(newSlot => ({ ...newSlot, content: oldSlots.find(slot => slot.type === newSlot.type)?.content ?? [] }));

    patchState(this.state, { slots: newSlots });
  }

  updateOptions(options: Chart['settings']): void {
    patchState(this.state, { options });
  }

  updateSlots(slots: Chart['slots']): void {
    patchState(this.state, { slots: [ ...slots ] });

    const { regularTableSlots, pivotTableSlots } = this.transformSlotsToTableSlots();
    patchState(this.state, { tableSlots: this.state.tableType() === 'regular-table' ? regularTableSlots : pivotTableSlots });
  }

  updateFilters(filters: FilterSlot[]): void {
    patchState(this.state, { filters: [...filters ?? []] });
  }

  setFilterOperator(operator: 'and' | 'or'): void {
    patchState(this.state, { filterOperator: operator });
  }

  setTableType(tableType: 'regular-table' | 'pivot-table'): void {
    patchState(this.state, { tableType });
    this.updateSlots([...this.slots()]);
  }

  private transformSlotsToTableSlots() {
    let regularTableSlots: Pick<Slot, 'name' | 'content'>[] = [
      { name: 'columns', content: [] }
    ];
    let pivotTableSlots: Pick<Slot, 'name' | 'content'>[] = [
      { name: 'row', content: [] },
      { name: 'column', content: [] },
      { name: 'measure', content: [] }
    ];

    // first the dimensions & then the measures, we seperate them purely on slot name if more than 1 dimension we consider it as a column in the pivot table
    const dimensionSlots = this.slots().filter(slot => slot.name !== 'measure' && (slot.name as any) !== 'measures');
    const measuresSlot = this.slots().filter(slot => slot.name === 'measure' || (slot.name as any) === 'measures');
    let rowSlots = dimensionSlots;
    let columnSlots: Slot[] = [];
    if (dimensionSlots.length > 1) {
      rowSlots = dimensionSlots.slice(0, dimensionSlots.length - 1);
      columnSlots = dimensionSlots.slice(dimensionSlots.length - 1);
    }
    for (const slot of rowSlots) {
      for (const slotContent of slot.content) {
        regularTableSlots[0].content.push(slotContent);
        pivotTableSlots[0].content.push(slotContent);
      }
    }
    for (const slot of columnSlots) {
      for (const slotContent of slot.content) {
        pivotTableSlots[1].content.push(slotContent);
      }
    }
    for (const slot of measuresSlot) {
      for (const slotContent of slot.content) {
        regularTableSlots[0].content.push(slotContent);
        pivotTableSlots[2].content.push(slotContent);
      }
    }

    return { regularTableSlots, pivotTableSlots };
  }

  undo(): void {

  }

  redo(): void {

  }

  private transformToFlexFilters() {
    const filters = this.filters()
        .filter((filterSlot) => filterSlot.filter !== null)
        .map((filterSlot) => {
          const dataset_id = filterSlot.set;
          const column_id = filterSlot.column;
          const expression = filterSlot.filter?.expression!;
          const args = filterSlot.filter?.arguments ?? null;

          const parameters = [
            {
              column_id,
              dataset_id,
            }
          ] as any[];

          if (args) {
            const columnType = filterSlot.type;
            let typedArgs: Value | Value[];
            if (columnType === 'numeric') {
              if (Array.isArray(args)) {
                typedArgs = args.map((arg: string) => parseFloat(arg));
              } else {
                typedArgs = parseFloat(args);
              }
            } else {
              typedArgs = args;
            }
            parameters.push(typedArgs);
          }

          return {
            expression,
            parameters
          };
        });

    return [
      {
        condition: this.filterOperator(),
        filters: filters,
      },
    ] as any;
  }
}
