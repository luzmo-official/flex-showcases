import { Component, DestroyRef, inject, input, OnInit, SimpleChanges } from '@angular/core';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { COUNTRIES } from '../../constants/countries.constant';
import { ThemeService } from '../../services/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DARKTHEME, LIGHTTHEME } from '../../constants/theme.constant';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-metric-selector',
  standalone: true,
  imports: [NgxLuzmoVizItemComponent, MatMenuModule, MatSelectModule, MatIconModule],
  templateUrl: './metric-selector.component.html',
  styleUrl: './metric-selector.component.scss'
})
export class MetricSelectorComponent implements OnInit{
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  country = input<string>();
  countries = input<any>();
  countriesList: any = []
  metrics = input<any>();
  metricsArray: any = [];
  activeMetric: any;
  activeCountry: any;
  showGermanyNoGames = false;
  darkOrLightMode = 'dark';

  authKey!: string;
  authToken!: string;

  constructor() {
    const auth = this.authService.getAuth();
    this.authKey = auth.authKey;
    this.authToken = auth.authToken;
  }
  
  ngOnInit() {
    this.metricsArray = JSON.parse(JSON.stringify(this.metrics()));
    this.activeMetric = this.metricsArray?.[0];
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
  }
    
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['country'] || changes['countries']) {
      if ((this.country() === 'GER' || (this.countries() && this.countries().includes('GER'))) && new Date() <= new Date('2024-06-14T19:00:00Z')) {
        this.countriesList = this.countries() ? [...COUNTRIES].filter((c) => this.countries().includes(c.key) && c.key !== 'GER') : [];
        this.showGermanyNoGames = true;
      } else {
        this.showGermanyNoGames = false;
        this.countriesList = this.countries() ? [...COUNTRIES].filter((c) => this.countries().includes(c.key)) : [];
      }
      this.activeCountry = this.country() ? COUNTRIES.find((c) => this.country() === c.key) : this.countriesList ? this.countriesList?.[0] : COUNTRIES[0];
      for (const metric of this.metricsArray) {
        metric.chart.filters[0].filters[0].parameters[1] = [this.activeCountry.key];
      }
      this.setActiveCountry(this.activeCountry);
    }
  }

  setActiveMetric(metric: any) {
    this.activeMetric = metric;
  }

  setActiveCountry(country: any) {
    this.activeCountry = country;
    for (const metric of this.metricsArray) {
      metric.chart.filters[0].filters[0].parameters[1] = [this.activeCountry.key];
    }
  }

  setChartsTheme(theme: string) {
    for (const metric of this.metricsArray) {
      if (metric.chart.options) {
        metric.chart.options.theme = theme === 'dark' ? JSON.parse(JSON.stringify(DARKTHEME)) : JSON.parse(JSON.stringify(LIGHTTHEME));
      }
    }
  }

  onCustomEvent(event: any) {
    if (event?.data?.event === 'playersDetail') {
      this.router.navigate(['/player', event?.data?.extraData?.id?.value], { queryParams: { back: this.router.url}})
    }
  }
}
