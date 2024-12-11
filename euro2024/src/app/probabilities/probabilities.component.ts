import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { DOCUMENT, NgClass } from '@angular/common';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import {
  CreateProbabilityHeatTable,
  CreateFunnelProbabilityChart,
} from '../shared/constants/charts.constant';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../shared/services/auth.service';
import { ThemeService } from '../shared/services/theme.service';
import { ScrollService } from '../shared/services/scroll.service';
import { filter, tap } from 'rxjs/operators';
import { DATASETS } from '../shared/constants/datasets.constant';
import { DARKTHEME, LIGHTTHEME } from '../shared/constants/theme.constant';
import { COUNTRIES } from '../shared/constants/countries.constant';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../shared/services/data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-probabilities',
  standalone: true,
  imports: [
    NgClass,
    NgxLuzmoVizItemComponent,
    MatIconModule,
    MatMenuModule,
    MatSliderModule,
    MatButtonModule
  ],
  templateUrl: './probabilities.component.html',
  styleUrl: './probabilities.component.scss',
})
export class ProbabilitiesComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);
  private readonly scrollService = inject(ScrollService);
  private readonly dataService = inject(DataService);

  smallScreen = true;

  $playNumber: Subject<{ number: number, manual: boolean }> = new Subject<{ number: number, manual: boolean }>();
  
  authKey!: string;
  authToken!: string;
  teamCountryFilter: any;
  darkOrLightMode = 'dark';
  probabilityDates: string[] = [];
  activeDate: any;
  countriesList = COUNTRIES;
  activeCountry =
    this.countriesList.find((c) => c.key === 'FRA') ?? this.countriesList[0];
  status = { loading: true, displayPicker: false, playing: false };
  explanation: string =
    'Greetings, land-dwellers! I am OctoPundit, the all-seeing AI octopus, here to reveal my predictions for the European 2024 football tournament! Dive in to discover which teams will rise like champions and which will sink. Scroll on and witness the future of football through the eyes of an aquatic oracle.';

  constructor() {
    const auth = this.authService.getAuth();
    this.authKey = auth.authKey;
    this.authToken = auth.authToken;

    this.dataService.retrieveProbabilitiesDates()
      .pipe(
        takeUntilDestroyed(),
        tap((result) => {
          this.probabilityDates = result?.data?.sort() ?? [];
          this.activeDate = this.probabilityDates
            ? { 
              index: this.probabilityDates.length -1,
              value: this.probabilityDates[this.probabilityDates.length -1],
              dateString: (new Date(this.probabilityDates[this.probabilityDates.length -1])).toDateString(),
              shortDateString: (new Date(this.probabilityDates[this.probabilityDates.length -1])).toLocaleDateString()
            }
            : '';
        })
      )
      .subscribe();

    this.breakpointObserver
      .observe(`(max-width: 1023px)`)
      .pipe(takeUntilDestroyed())
      .subscribe((state) => {
        this.smallScreen = state.matches;
      });
  }
  probabilityHeatTable = CreateProbabilityHeatTable();
  funnelProbabilityChart = CreateFunnelProbabilityChart();

  ngOnInit(): void {
    this.setActiveCountry(this.activeCountry);

    this.themeService.darkOrLightMode
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((theme) => {
          this.darkOrLightMode = theme;
          this.setChartsTheme(theme);
        })
      )
      .subscribe();

    this.$playNumber
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event: { number: number, manual: boolean }) => this.status.playing || event.manual),
        tap((event: { number: number, manual: boolean }) => {
          this.activeDate = {
            index: event.number,
            value: this.probabilityDates[event.number],
            dateString: (new Date(this.probabilityDates[event.number])).toDateString(),
            shortDateString: (new Date(this.probabilityDates[event.number])).toLocaleDateString()
          };
          const filter = {
            expression: '? = ?',
            parameters: [
              {
                dataset_id: DATASETS['tournamentProbabilitiesPerTeam'].set,
                column_id:
                  DATASETS['tournamentProbabilitiesPerTeam'].columns[
                    'date'
                  ].column,
              },
              this.probabilityDates[event.number],
            ]
          };
          this.probabilityHeatTable.filters[0].filters[0] = filter;
          this.funnelProbabilityChart.filters[0].filters[1] = filter;
        })
      )
      .subscribe();
  }

  setChartsTheme(theme: string) {
    this.probabilityHeatTable.options =
      this.probabilityHeatTable?.options || {};
    this.probabilityHeatTable.options.theme =
      this.darkOrLightMode === 'dark'
        ? JSON.parse(JSON.stringify(DARKTHEME))
        : JSON.parse(JSON.stringify(LIGHTTHEME));
    this.funnelProbabilityChart.options.theme =
      this.darkOrLightMode === 'dark'
        ? JSON.parse(JSON.stringify(DARKTHEME))
        : JSON.parse(JSON.stringify(LIGHTTHEME));
  }

  setActiveCountry(country: any) {
    this.activeCountry = country;
    this.funnelProbabilityChart.filters[0].filters[0].parameters[1] = [
      country.key,
    ];
    if (this.smallScreen) {
      const funnel: HTMLElement | null = this.document.querySelector('#funnel');
      this.scrollService.scrollToElement(funnel);
    }
  }

  setActiveProbabilityDate(event: any) {
    this.$playNumber.next({ number: event.value, manual: true });
  }

  onCustomEvent(event: any) {
    const countryKey = event.data['y-axis'].id;
    const country = this.countriesList.find((c) => c.key === countryKey);
    if (country) {
      this.setActiveCountry(country);
    }
  }

  onRenderedProbabilitiesDate(event: any) {
    const atTheEnd = this.activeDate.index === this.probabilityDates.length - 1;
    if (this.status.playing && atTheEnd) {
      this.pause();
    }
    const nextIndex = atTheEnd ? 0 : this.activeDate.index + 1;
    setTimeout(() => {
      this.$playNumber.next({ number: nextIndex, manual: false });
    }, 2000);
  }

  play() {
    this.status.playing = true;
    const nextIndex = this.activeDate.index + 1 < this.probabilityDates.length ? this.activeDate.index + 1 : 0;
    this.$playNumber.next({ number: nextIndex, manual: false });
  }

  pause() {
    this.status.playing = false;
  }

  onRendered(event: any) {
    this.status.displayPicker = true;
  }
}
