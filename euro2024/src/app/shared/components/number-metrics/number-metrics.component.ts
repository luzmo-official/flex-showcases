import { Component, inject, input, OnChanges, SimpleChanges, DestroyRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { GENERICTEAMCOUNTRYFILTER } from '../../constants/charts.constant';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LIGHTTHEME, DARKTHEME } from '../../constants/theme.constant';
import { tap } from 'rxjs';

@Component({
  selector: 'app-number-metrics',
  standalone: true,
  imports: [NgxLuzmoVizItemComponent],
  templateUrl: './number-metrics.component.html',
  styleUrl: './number-metrics.component.scss'
})
export class NumberMetricsComponent implements OnChanges {
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);

  smallScreen = true;
  country = input<string>();
  metrics = input<any>();

  authKey!: string;
  authToken!: string;
  teamCountryFilter: any;
  showGermanyNoGames = false;
  darkOrLightMode = 'dark';

  constructor() {
    const auth = this.authService.getAuth();
    this.authKey = auth.authKey;
    this.authToken = auth.authToken;
  }

  ngOnInit(): void {
    this.breakpointObserver.observe(`(max-width: 1023px)`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.smallScreen = state.matches;
        if (this.smallScreen) {
          this.setSmallFontSize(true);
        } else {
          this.setSmallFontSize(false);
        }
      });

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
    if (changes['country']) {
      this.teamCountryFilter = GENERICTEAMCOUNTRYFILTER();
      this.teamCountryFilter[0].filters[0].parameters[1] = [this.country()];
      if (this.country() === 'GER' && new Date() <= new Date('2024-06-14T19:00:00Z')) {
        this.showGermanyNoGames = true;
      } else {
        this.showGermanyNoGames = false;
      }
    }
  }

  setSmallFontSize(small: boolean) {
    for (const metric of this.metrics()) {
      if (metric.options) {
        metric.options.numberFontSize = small ? 32 : 40;
        if (metric.options.theme?.font) {
          metric.options.theme.font.fontSize = small ? 14 : 18;
        }
      }
    }
  }

  setChartsTheme(theme: string) {
    for (const metric of this.metrics()) {
      metric.options.theme = this.darkOrLightMode === 'dark' ? JSON.parse(JSON.stringify(DARKTHEME)) : JSON.parse(JSON.stringify(LIGHTTHEME));
    }
    if (this.smallScreen) {
      this.setSmallFontSize(true);
    } else {
      this.setSmallFontSize(false);
    }
  }
}
