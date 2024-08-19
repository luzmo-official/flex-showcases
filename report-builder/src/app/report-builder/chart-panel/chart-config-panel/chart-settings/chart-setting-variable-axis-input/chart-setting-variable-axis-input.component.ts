import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chart-setting-variable-axis-input',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './chart-setting-variable-axis-input.component.html',
  styleUrl: './chart-setting-variable-axis-input.component.scss'
})
export class ChartSettingVariableAxisInputComponent {
  label = input<string>();
  value = input<number[]>();
  range: number[] = this.value() ?? [];
  valueChange = output<number[]>();

  setValue(value: number, index: number) {
    if (index > 1 && this.range.length < 2) {
      this.range[0] = 0;
    };
    this.range[index] = value;
    this.valueChange.emit(this.range);
  }
}
