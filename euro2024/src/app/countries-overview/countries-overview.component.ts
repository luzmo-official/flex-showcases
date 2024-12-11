import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COUNTRIES } from '../shared/constants/countries.constant';

@Component({
  selector: 'app-countries-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './countries-overview.component.html',
  styleUrl: './countries-overview.component.scss'
})
export class CountriesOverviewComponent {
  countries = [...COUNTRIES].sort((a, b) => a.title.localeCompare(b.title));
}
