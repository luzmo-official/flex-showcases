import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup
} from '@angular/cdk/drag-drop';
import { ChartService } from '../../../shared/services/chart.service';
import { Slot } from '../../../shared/models/models';
import { COLUMN_TYPE_ICONS } from '../../../shared/constants/charts.constant';

@Component({
  selector: 'app-slots-display',
  standalone: true,
  imports: [MatIconModule, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './slots-display.component.html',
  styleUrl: './slots-display.component.scss'
})
export class SlotsDisplayComponent {
  readonly chartService = inject(ChartService);
  columnTypeIcons = COLUMN_TYPE_ICONS;

  drop(event: CdkDragDrop<string[]>) {
    const column = event.item.data;
    const slotName: Slot['name'] = event.container.id.replace('data-drop-', '') as Slot['name'];
    const slotContent: Slot['content'][number] = {
      label: column.name,
      set: column.securable_id,
      column: column.id,
      type: column.type,
      subtype: column.subtype,
      format: column.format
    };

    const slot = this.chartService.slots().find(slot => slot.name === slotName);

    if (slot) {
      slot.content.push(slotContent);
      this.chartService.updateSlots((this.chartService.slots() ?? []));
    }
  }

  replace(event: CdkDragDrop<string[]>, index: number) {
    const column = event.item.data;
    const slotNameTemp = event.container.id.replace('data-replace-', '');
    const slotName = slotNameTemp.substring(0, slotNameTemp.lastIndexOf('-')) as Slot['name'];
    
    const slotContent: Slot['content'][number] = {
      label: column.name,
      set: column.securable_id,
      column: column.id,
      type: column.type,
      subtype: column.subtype,
      format: column.format
    };

    const slot = this.chartService.slots().find(slot => slot.name === slotName);

    if (slot?.content?.[index]) {
      slot.content[index] = slotContent;
      this.chartService.updateSlots((this.chartService.slots() ?? []));
    }
  }

  removeColumnFromSlot(slotName: string, indexToRemove: number): void {
    const slot = this.chartService.slots().find(slot => slot.name === slotName);

    if (slot) {
      slot.content = slot.content.filter((_: any, index: number) => index !== indexToRemove);
      this.chartService.updateSlots((this.chartService.slots() ?? []));
    }
  }
}
