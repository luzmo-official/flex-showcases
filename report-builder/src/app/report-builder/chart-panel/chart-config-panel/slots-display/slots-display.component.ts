import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';

import '@luzmo/analytics-components-kit/item-slot-drop-panel';
import { VizItemSlot } from '@luzmo/dashboard-contents-types';

@Component({
    selector: 'app-slots-display',
    imports: [],
    templateUrl: './slots-display.component.html',
    styleUrl: './slots-display.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SlotsDisplayComponent {
  @Input({ required: true }) authKey!: string;
  @Input({ required: true }) authToken!: string;
  @Input({ required: true }) itemType!: string;
  @Input({ required: true }) slots!: VizItemSlot[];

  @Output() slotsChanged = new EventEmitter<Event>();

  onSlotsChanged(event: Event) {
    this.slotsChanged.emit(event);
  }
}
