import { Component, input, output, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-chart-setting-color-palette',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './chart-setting-color-palette.component.html',
  styleUrl: './chart-setting-color-palette.component.scss'
})
export class ChartSettingColorPaletteComponent implements OnInit{
  label = input<string>();
  value = input<string>();
  values = input<{ key:string; label: string; colors: string[] }[]>();
  valueChange = output<string>();

  selected!: string;

  constructor() {
    this.selected = this.value() ?? this.values()?.[0]?.key ?? '';
  }

  ngOnInit() {
    this.selected = this.value() ?? this.values()?.[0]?.key ?? '';
  }

  setValue(value: string) {
    this.valueChange.emit(value);
  }
}
