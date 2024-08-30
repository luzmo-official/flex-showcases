import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  NgxLuzmoVizItemComponent,
  NgxLuzmoDashboardModule,
} from '@luzmo/ngx-embed';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawerMode } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DashboardFilterPanelSettingsDialogComponent } from './settings-dialog/settings-dialog.component';

// Userflow is only necessary for the Luzmo hosted showcases
import userflow from 'userflow.js'
userflow.init('ct_65z5oczamna45bveai47cpcbpe');
userflow.identifyAnonymous();

@Component({
  selector: 'app-dashboard-filter-panel',
  standalone: true,
  imports: [
    FormsModule,
    NgxLuzmoDashboardModule,
    NgxLuzmoVizItemComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterLink,
    DashboardFilterPanelSettingsDialogComponent,
  ],
  templateUrl: './dashboard-filter-panel.component.html',
  styleUrl: './dashboard-filter-panel.component.scss',
})
export class DashboardFilterPanelComponent {
  public readonly dialog = inject(MatDialog);
  dashboardId: string = 'd5101db1-e369-4712-acfc-bfce5d97616d';
  datasetId: string = 'e2217802-c66a-4571-bd60-4846eb15871e';
  donutColumn: string = 'f3164298-5e89-4b1b-8423-c826508daf97';
  amountColumn: string = 'f3b270b4-fe0f-4ac4-b5f3-69280c396735';
  phaseColumn: string = '493a29fd-cb69-4e15-bc40-133af8fb714d';
  panelPosition: string = 'right';
  panelMode: MatDrawerMode = 'over';
  panelBackdrop?: boolean = true;

  openDialog(): void {
    const dialogRef = this.dialog.open(
      DashboardFilterPanelSettingsDialogComponent,
      {
        data: {
          panelMode: this.panelMode,
          panelPosition: this.panelPosition,
          panelBackdrop: this.panelBackdrop,
        },
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      this.panelPosition = result.panelPosition;
      this.panelMode = result.panelMode;
      this.panelBackdrop = result.panelBackdrop;
    });
  }
}
