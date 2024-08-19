import { Component } from '@angular/core';
import { ChartPanelComponent } from './chart-panel/chart-panel.component';
import { ChartViewComponent } from './chart-view/chart-view.component';
import { DataPanelComponent } from './data-panel/data-panel.component';
import { HeaderComponent } from './header/header.component';
import { MatSelectModule } from '@angular/material/select';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [ChartPanelComponent, ChartViewComponent, DataPanelComponent, MatSelectModule, HeaderComponent],
  templateUrl: './report-builder.component.html',
  styleUrls: ['./report-builder.component.scss'],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ]
})

export class ReportBuilderComponent {

}
