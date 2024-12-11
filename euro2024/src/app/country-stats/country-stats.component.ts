import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COUNTRIES, Country } from '../shared/constants/countries.constant';
import { CountryStatsTeamComponent } from './country-stats-team/country-stats-team.component';
import { MatMenuModule } from '@angular/material/menu';
import { Meta, Title } from '@angular/platform-browser';
import { CountryStatsDefenseComponent } from './country-stats-defense/country-stats-defense.component';
import { CountryStatsOffenseComponent } from './country-stats-offense/country-stats-offense.component';
import { CountryStatsKeeperComponent } from './country-stats-keeper/country-stats-keeper.component';

@Component({
  selector: 'app-per-country',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    MatIconModule,
    MatMenuModule,
    CountryStatsDefenseComponent,
    CountryStatsOffenseComponent,
    CountryStatsKeeperComponent,
    CountryStatsTeamComponent
  ],
  templateUrl: './country-stats.component.html',
  styleUrl: './country-stats.component.scss',
})
export class CountryStatsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  countries: Country[] = COUNTRIES.sort((a: Country, b: Country) => a.title.localeCompare(b.title));
  country!: Country;
  activeTab = 'team';
  tabs = [
    { key: 'team', title: 'Team' },
    { key: 'offense', title: 'Attack' },
    { key: 'defense', title: 'Defense' },
    { key: 'keeper', title: 'Keeper' }
  ];
  status = { loading: true };

  constructor() {
    this.route.params
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        this.country = this.countries.find(c => c.key === params['id']) ?? this.countries[0];
        const title = `${this.country.title}: Qualifiers & Tournament stats`;
        this.title.setTitle(title);
        const description = `Check ${this.country.title} in terms of EURO 2024 team, attack, defense, and keeper stats. What is the chance they will win the EURO2024? Built with Luzmo - embedded analytics in your software.`;
        this.meta.updateTag({ name: 'og:title', content: title });
        this.meta.updateTag({ name: 'twitter:title', content: title });
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ name: 'og:description', content: description });
        this.meta.updateTag({ name: 'twitter:description', content: description });
      });
  }

  setTab(tabKey: string) {
    this.activeTab = tabKey;
  }

  onCountryChanged(country: Country): void {
    this.country = { ...this.countries.find(c => c.key === country.key)! };

    this.router.navigate([`country/${this.country.key}`]);
  }
}
