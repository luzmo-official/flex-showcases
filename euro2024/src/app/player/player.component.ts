import { Component, DestroyRef, inject } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { tap, switchMap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DataService } from '../shared/services/data.service';
import { CreateEAProfileRadarChart, CreateNumberChart, GENERICPLAYERFILTER } from '../shared/constants/charts.constant';
import { COUNTRIES } from '../shared/constants/countries.constant';
import { AuthService } from '../shared/services/auth.service';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { ThemeService } from '../shared/services/theme.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DARKTHEME, LIGHTTHEME } from '../shared/constants/theme.constant';
import { DATASETS } from '../shared/constants/datasets.constant';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [NgClass, RouterLink, MatIconModule, NgxLuzmoVizItemComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent{
  private readonly route = inject(ActivatedRoute);
  private readonly dataService = inject(DataService);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private destroyRef = inject(DestroyRef);

  authKey!: string;
  authToken!: string;

  countries = COUNTRIES;
  darkOrLightMode = 'dark';
  smallScreen = false;

  playerId!: number;
  previousPlayerId!: number;
  nextPlayerId!: number;
  backUrl: string = 'calendar';
  queryParams: string = '';
  status = { loading: true, error: false, fetchedSquad: false};
  playerData: {
    name: string;
    countryIso?: string;
    countryName?: string;
    position?: string;
    countryCode?: string;
    jerseyNumber?: number;
    age?: string;
    weight?: string;
    height?: string;
  } = { name: '' };
  countryColor: string = 'gray';
  numberCharts: any = [];
  radarChart: any;

  filters: any = {};
  
  constructor() {
    const auth = this.authService.getAuth();
    this.authKey = auth.authKey;
    this.authToken = auth.authToken;
    this.route.params
      .pipe(
        takeUntilDestroyed(),
        switchMap((params) => {
          this.playerId = parseInt(params['id'] ?? '97058');
          this.status.loading = true;
          this.status.fetchedSquad = false;
          this.filters = {
            players: GENERICPLAYERFILTER(),
            eaProfiles: GENERICPLAYERFILTER('eaProfiles'),
            marketValue: GENERICPLAYERFILTER('marketValue')
          }
          return this.dataService.retrievePlayerTournamentDetails(this.playerId.toString());
        }),
        tap((result) => {
          const playerDataResponse = result.data[0];
          const country = this.countries.find((c) => c.key === playerDataResponse?.[7]?.id);
          this.playerData = {
            name: playerDataResponse?.[1]?.id,
            age:  playerDataResponse?.[2],
            height:  playerDataResponse?.[3],
            weight:  playerDataResponse?.[4],
            position:  playerDataResponse?.[6].id,
            jerseyNumber:  playerDataResponse?.[5],
            countryIso: country?.iso,
            countryCode: country?.key,
            countryName: country?.title
          };
          this.status.loading = false;
          this.countryColor = country?.color || 'gray';
          this.numberCharts = this.playerData?.position === 'GOALKEEPER' 
            ? [
              CreateNumberChart('players', 'matchesAppearances', 'sum', 'Matches'),
              CreateNumberChart('players', 'saves', 'sum', 'Saves'),
              CreateNumberChart('players', 'goalsConceded', 'sum', 'Goals Conceded'),
              CreateNumberChart('players', 'cleanSheets', 'sum', 'Clean Sheets'),
              CreateNumberChart('players', 'yellowCards', 'sum', 'Yellow Cards'),
              CreateNumberChart('players', 'redCards', 'sum', 'Red Cards'),
              CreateNumberChart('eaProfiles', 'overallScore', 'average', 'EA Sports FC rating'),
              CreateNumberChart('marketValue', 'marketValue', 'average', 'Market value'),
            ]
            : [
              CreateNumberChart('players', 'matchesAppearances', 'sum', 'Matches'),
              CreateNumberChart('players', 'goals', 'sum', 'Goals'),
              CreateNumberChart('players', 'assists', 'sum', 'Assists'),
              CreateNumberChart('players', 'attempts', 'sum', 'Attempts'),
              CreateNumberChart('players', 'yellowCards', 'sum', 'Yellow Cards'),
              CreateNumberChart('players', 'redCards', 'sum', 'Red Cards'),
              CreateNumberChart('eaProfiles', 'overallScore', 'average', 'EA Sports FC rating'),
              CreateNumberChart('marketValue', 'marketValue', 'average', 'Market value')
            ];

          for (const numberChart of this.numberCharts) {
            // see what dataset is being used in slots
            const datasetUsed: string = numberChart.slots[0].content[0].set;
            if (datasetUsed) {
              const datasetsKeyMap: any = {}
              Object.entries(DATASETS).forEach(([key, value], i) => datasetsKeyMap[value.set] = key );
              const datasetName = datasetsKeyMap[datasetUsed];
              if (datasetName) {
                numberChart.filters = JSON.parse(JSON.stringify(this.filters[datasetName] ?? []));
                numberChart.filters[0].filters[0].parameters[1] = this.playerId;
              }
            }
          }
          this.radarChart = CreateEAProfileRadarChart(this.playerData?.position ?? '');
          this.radarChart.filters[0].filters[0].parameters[1] = this.playerId;
          this.radarChart.options.theme = this.darkOrLightMode === 'dark' ? JSON.parse(JSON.stringify(DARKTHEME)) : JSON.parse(JSON.stringify(LIGHTTHEME));
          this.setChartsTheme(this.darkOrLightMode);
        }),
        switchMap(() => this.dataService.retrieveSquad(this.playerData.countryCode ?? 'BEL')),
        tap((result) => {
          this.status.fetchedSquad = true;
          const players = result?.data ?? [];
          const playerIndex = players.findIndex((p: any) => p[0] === this.playerId);
          this.previousPlayerId = playerIndex > 0 ? players[playerIndex - 1][0] : players[players.length - 1][0];
          this.nextPlayerId = playerIndex < players.length - 1 ? players[playerIndex + 1][0] : players[0][0];
          this.status.fetchedSquad = true;
        })
      )
      .subscribe();

      this.route.queryParams
        .pipe(
          takeUntilDestroyed(),
          tap((params) => {
            if (params['back']) {
              this.backUrl = params['back'];
            }
          })
        )
        .subscribe();

    this.themeService.darkOrLightMode
      .pipe(
        takeUntilDestroyed(),
        tap((theme) => {
          this.darkOrLightMode = theme;
          this.setChartsTheme(theme);
        })
      )
      .subscribe();
  }

  ngOnInit() {
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
  }

  goBack() {
    this.router.navigate([this.backUrl ?? '/calendar']);
  }

  goToPlayer(playerId: number) {
    if (this.status.fetchedSquad) {
      this.router.navigate(['/player', playerId], { queryParams: { back: this.backUrl } });
    }
  }

  setSmallFontSize(small: boolean) {
    for (const numberChart of this.numberCharts) {
      if (numberChart.options) {
        numberChart.options.numberFontSize = small ? 32 : 40;
        if (numberChart.options.theme?.font) {
          numberChart.options.theme.font.fontSize = small ? 14 : 18;
        }
      }
    }
  }

  setChartsTheme(theme: string) {
    if (this.radarChart?.options) {
      this.radarChart.options.theme = this.darkOrLightMode === 'dark' ? JSON.parse(JSON.stringify(DARKTHEME)) : JSON.parse(JSON.stringify(LIGHTTHEME));
    }
    for (const numberChart of this.numberCharts) {
      numberChart.options = numberChart?.options || {};
      numberChart.options.theme = this.darkOrLightMode === 'dark' ? JSON.parse(JSON.stringify(DARKTHEME)) : JSON.parse(JSON.stringify(LIGHTTHEME));
    }
    if (this.smallScreen) {
      this.setSmallFontSize(true);
    } else {
      this.setSmallFontSize(false);
    }
  }
}
