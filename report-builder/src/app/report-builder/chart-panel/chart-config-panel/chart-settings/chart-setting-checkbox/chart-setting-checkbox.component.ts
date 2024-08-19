import { Component, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-chart-setting-checkbox',
  standalone: true,
  imports: [FormsModule, MatCheckboxModule],
  templateUrl: './chart-setting-checkbox.component.html',
  styleUrl: './chart-setting-checkbox.component.scss'
})
export class ChartSettingCheckboxComponent implements OnInit{
  label = input<string>();
  value = input<boolean>();
  valueChange = output<boolean>();

  checked: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.checked = this.value() ?? false;
  }

  setValue(value: boolean) {
    this.checked = value;
    this.valueChange.emit(value);
  }
}
