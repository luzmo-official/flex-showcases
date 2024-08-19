import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chart-filter-panel-settings-dialog',
  templateUrl: 'settings-dialog.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSelectModule,
  ],
})
export class DashboardFilterPanelSettingsDialogComponent {
  public readonly dialogRef = inject<
    MatDialogRef<DashboardFilterPanelSettingsDialogComponent>
  >(MatDialogRef<DashboardFilterPanelSettingsDialogComponent>);
  public readonly data = inject<any>(MAT_DIALOG_DATA);
  positions = ['left', 'right'];
  modes = ['over', 'push', 'side'];
  backdrops = [
    { key: null, value: 'unset' },
    { key: true, value: 'true' },
    { key: false, value: 'false' },
  ];

  onNoClick(): void {
    this.dialogRef.close();
  }
}
