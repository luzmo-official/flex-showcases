import { Routes } from '@angular/router';
import { CountriesOverviewComponent } from './countries-overview/countries-overview.component';
import { CountryVsCountryComponent } from './country-vs-country/country-vs-country.component';
import { PlayerComponent } from './player/player.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CountryStatsComponent } from './country-stats/country-stats.component';
import { ProbabilitiesComponent } from './probabilities/probabilities.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'player',
        children: [
          { 
            path: '',
            redirectTo: '250003911',
            pathMatch: 'full'
          },
          { path: ':id', component: PlayerComponent }
        ]
      },/*
      {
        path: 'country',
        children: [
          { 
            path: '',
            component: CountriesOverviewComponent
          },
          {
            path: ':id',
            component: PerCountryComponent
          }
        ]
      }, */
      {
        path: 'compare',
        children: [
          {
            path: ':id',
            component: CountryVsCountryComponent,
          }
        ],
      },
      {
        path: 'country',
        children: [
          {
            path: ':id',
            component: CountryStatsComponent,
          }
        ],
      },
      {
        path: 'probabilities',
        component: ProbabilitiesComponent,
        title: 'Can you predict the EURO2024 winner using analytics?'
      },
      {
        path: 'calendar',
        component: CalendarComponent,
        title: 'Can you predict the EURO2024 winner using analytics?'
      },
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full'
      },
      {
        path: '**',
        component: CalendarComponent,
        title: 'Games calendar'
      }
    ],
  },
];
