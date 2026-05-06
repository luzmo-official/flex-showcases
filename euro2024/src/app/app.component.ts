import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, PLATFORM_ID, Renderer2, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AuthService } from './shared/services/auth.service';
import { DATASETS } from './shared/constants/datasets.constant';
import { AnalyticsService } from './shared/services/analytics.service';
import { ThemeService } from './shared/services/theme.service';
import { ThemeMode } from './shared/models/common.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ScrollService } from './shared/services/scroll.service';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, MatButtonModule, MatToolbarModule, MatIconModule, NgxLuzmoVizItemComponent, MatTabsModule, RouterLink, MatSidenavModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authService = inject(AuthService);
  private readonly scrollService = inject(ScrollService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  // needed to log & initialize analytics
  private readonly analyticsService = inject(AnalyticsService);
  private readonly themeService = inject(ThemeService);
  private renderer = inject(Renderer2);

  @ViewChild(MatSidenav, { static: true }) sideNav!: MatSidenav;

  routePath?: string;
  activePage = 'games';
  datasetLastModifiedDate?: string;
  showThemeSwitcher = false;
  currentTheme?: ThemeMode;
  smallScreen = false;
  dockSideNav = false;

  get isOpened() {
    return this.dockSideNav;
  }

  pages = [
    { key: 'games', title: 'Games' },
    { key: 'country', title: 'Countries' },
    { key: 'player', title: 'Players' },
    { key: 'head-to-head', title: 'Head to head' }
  ];

  constructor() {
    this.initUserflow();

    this.breakpointObserver.observe(`(max-width: 1023px)`)
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        this.smallScreen = state.matches;
        if (!this.smallScreen) {
          this.dockSideNav = false;
        }
      });

    this.themeService.initializeTheme(this.renderer);
    this.themeService.currentThemeMode
      .pipe(
        takeUntilDestroyed(),
        tap(theme => {
          this.currentTheme = theme;
          this.showThemeSwitcher = true;
        })
      )
      .subscribe();

    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event: any) => event instanceof NavigationEnd),
        tap((event) => {
          let url = event.url;
          this.scrollService.scrollToTop();
          if (event.url.startsWith('/')) {
            url = event.url.substring(1);
          }
          this.activePage = url.split('/')[0];
          this.dockSideNav = false;
          if (this.smallScreen) {
            this.sideNav.close();
          }
        })
      )
      .subscribe();

    this.fetchDatasetLastUpdatedDate()
      .subscribe(date => this.datasetLastModifiedDate = new Date(date).toLocaleString());
  }

  private initUserflow(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // `userflow.js` accesses `document` during import, so SSR must avoid loading it.
    void import('userflow.js').then((m: any) => {
      const userflow = m?.default ?? m;
      userflow.init('ct_65z5oczamna45bveai47cpcbpe');
      userflow.identifyAnonymous();
    });
  }

  fetchDatasetLastUpdatedDate(): Observable<string> {
    return this.http.post<{ count: number, rows: any[] }>('https://api.luzmo.com/0.1.0/securable',
    {
      action: 'get',
      version: '0.1.0',
      key: this.authService.getAuth().authKey,
      token: this.authService.getAuth().authToken,
      find: {
        attributes: ['id', 'updated_at'],
        where: { id: DATASETS['teams'].set }
      }
    }, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        map(result => result.rows[0].updated_at)
      );
  }

  setChartsTheme(theme: ThemeMode): void {
    this.themeService.switchTheme(this.renderer, theme);
  }
}
