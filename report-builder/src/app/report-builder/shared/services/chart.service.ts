import { Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { Chart } from '../models/models';
import { switchItem } from '@luzmo/analytics-components-kit/utils';

type ChartState = {
  name: Chart['name'];
  type: Chart['type'];
  options: Chart['options'];
  slots: Chart['slots'];
  filters: Chart['filters'];
  icon: Chart['icon'];
  tableType: 'regular-table' | 'pivot-table';
  tableSlots: Pick<Chart['slots'][number], 'name' | 'content'>[];
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private state = signalState<ChartState>({
    name: 'Column Chart',
    type: 'column-chart',
    options: {
      display: {
        title: false,
      },
    },
    slots: [],
    filters: [],
    icon: 'bar_chart',
    tableType: 'regular-table',
    tableSlots: [{ name: 'columns', content: [] }]
  });

  name = this.state.name;
  type = this.state.type;
  options = this.state.options;
  slots = this.state.slots;
  filters = this.state.filters;
  icon = this.state.icon
  tableType = this.state.tableType;
  tableSlots = this.state.tableSlots;

  updateName(name: Chart['name']): void {
    patchState(this.state, { name });
  }

  async updateType(type: Chart['type']): Promise<void> {
    const oldType = this.type();

    if (oldType !== type) {
      try {
        const result = await switchItem({
          oldItemType: oldType,
          newItemType: type,
          slots: this.slots(),
          options: this.options() as Record<string, unknown>
        });
        
        patchState(this.state, { 
          type,
          slots: result.slots,
          options: result.options
        });
      } catch (error) {
        console.error('switchItem failed:', error);
      }
    }
  }

  updateOptions(options: Chart['options']): void {
    patchState(this.state, { options });
  }

  async updateSlots(slots: Chart['slots']): Promise<void> {
    patchState(this.state, { slots: [ ...slots ] });

    const { regularTableSlots, pivotTableSlots } = await this.transformSlotsToTableSlots();
    patchState(this.state, { tableSlots: this.state.tableType() === 'regular-table' ? regularTableSlots : pivotTableSlots });
  }

  updateFilters(filters: any[]): void {
    patchState(this.state, { filters: [...filters ?? []] });
  }

  async setTableType(tableType: 'regular-table' | 'pivot-table'): Promise<void> {
    patchState(this.state, { tableType });
    await this.updateSlots([...this.slots()]);
  }

  private async transformSlotsToTableSlots() {
    const currentType = this.type();
    
    const regularTableResult = await switchItem({
      oldItemType: currentType,
      newItemType: 'regular-table',
      slots: this.slots(),
      options: this.options() as Record<string, unknown>
    });

    const pivotTableResult = await switchItem({
      oldItemType: currentType,
      newItemType: 'pivot-table',
      slots: this.slots(),
      options: this.options() as Record<string, unknown>
    });

    return { 
      regularTableSlots: regularTableResult.slots,
      pivotTableSlots: pivotTableResult.slots
    };
  }

  undo(): void {

  }

  redo(): void {

  }
}
