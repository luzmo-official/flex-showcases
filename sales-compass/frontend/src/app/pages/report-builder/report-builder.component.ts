import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, inject, type Type } from '@angular/core';

import { LuzmoApiService } from '../../services/luzmo-api/luzmo-api.service';

@Component({
  selector: 'app-report-builder',
  imports: [NgComponentOutlet, AsyncPipe],
  templateUrl: './report-builder.component.html'
})
export class ReportBuilderComponent {
  private luzmoApiService = inject(LuzmoApiService);

  readonly reportBuilderComponent: Promise<Type<unknown>> =
    this.luzmoApiService.globalDashboardEditMode === 'full-ede'
      ? import('./ede-dashboard-editor/ede-dashboard-editor.component').then((component) => component.EdeDashboardEditorComponent)
      : import('./modular-report-builder/modular-report-builder.component').then((component) => component.ModularReportBuilderComponent);
}
