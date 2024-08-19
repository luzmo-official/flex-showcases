import { Component, input, output, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-chart-setting-dropdown',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './chart-setting-dropdown.component.html',
  styleUrl: './chart-setting-dropdown.component.scss'
})
export class ChartSettingDropdownComponent implements OnInit{
  label = input<string>();
  value = input<string>();
  values = input<{ key:string; label: string; }[]>();
  valueChange = output<string>();

  selected!: string;

  constructor() {
  }

  ngOnInit() {
    this.selected = this.value() ?? this.values()?.[0]?.key ?? '';
  }

  setValue(value: string) {
    this.valueChange.emit(value);
  }
}
