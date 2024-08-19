import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ChartService } from '../../../shared/services/chart.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CHARTS } from '../../../shared/constants/charts.constant';
import { JsonPipe } from '@angular/common';
import { tap } from 'rxjs';
import { ChartSettingCheckboxComponent } from './chart-setting-checkbox/chart-setting-checkbox.component';
import { ChartSettingDropdownComponent } from './chart-setting-dropdown/chart-setting-dropdown.component';
import { ChartSettingVariableAxisInputComponent } from './chart-setting-variable-axis-input/chart-setting-variable-axis-input.component';
import { ChartSettingTextInputComponent } from './chart-setting-text-input/chart-setting-text-input.component';
import { ChartSettingColorsComponent } from './chart-setting-colors/chart-setting-colors.component';
import { ChartSettingColorPaletteComponent } from './chart-setting-color-palette/chart-setting-color-palette.component';

@Component({
  selector: 'app-chart-settings',
  standalone: true,
  imports: [
    JsonPipe,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ChartSettingCheckboxComponent,
    ChartSettingDropdownComponent,
    ChartSettingVariableAxisInputComponent,
    ChartSettingTextInputComponent,
    ChartSettingColorsComponent,
    ChartSettingColorPaletteComponent,
  ],
  templateUrl: './chart-settings.component.html',
  styleUrl: './chart-settings.component.scss',
})
export class ChartSettingsComponent {
  private readonly chartService = inject(ChartService);

  currentChartType: string = 'bar-chart';
  currentChartOptions: any = {};
  chartSettings: any = CHARTS().find(
    (chart) => chart.type === this.currentChartType
  )?.settings;
  settingsKeys: string[] = Object.keys(this.chartSettings);

  constructor() {
    toObservable(this.chartService.type)
      .pipe(
        takeUntilDestroyed(),
        tap((type) => {
          this.currentChartType = type;
          this.chartSettings = CHARTS().find(
            (chart) => chart.type === this.currentChartType
          )?.settings;
          this.settingsKeys = Object.keys(this.chartSettings);
        })
      )
      .subscribe();

    toObservable(this.chartService.options)
      .pipe(
        takeUntilDestroyed(),
        tap((options) => {
          this.currentChartOptions = options;
        })
      )
      .subscribe();
  }

  setChartOption(event: any, transformFn: any) {
    this.chartService.updateOptions({ ...this.currentChartOptions, ...transformFn(event)});
  }

  applyChartOptions(options: any) {
    // transform settings to options
    this.chartService.updateOptions(options);
  }
}
