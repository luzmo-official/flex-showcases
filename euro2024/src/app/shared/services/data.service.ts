import { Injectable, inject } from '@angular/core';
import { DATASETS } from '../constants/datasets.constant';
import { AuthService } from './auth.service';
import Luzmo from '@luzmo/nodejs-sdk';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class DataService {
  private readonly authService = inject(AuthService);
  authKey: string;
  authToken?: string;
  cache: any = {};

  client: any;

  constructor() {
    const auth = this.authService.getAuth();
    this.authKey = auth.authKey;
    this.authToken = auth.authToken;

    this.client = new Luzmo({
      api_key: this.authKey,
      api_token: this.authToken,
      host: 'https://api.luzmo.com',
    });
  }

  retrieveGames(): Observable<any> {
    //return observable from cache if available and less than 5 minutes old
    if (this.cache?.games?.date && (new Date().getTime() - this.cache?.games?.date.getTime()) < 300000 && this.cache?.games?.value) {
      return from([this.cache?.games?.value]);
    }
    const columnsToRetrieve = [
      'id',
      'date',
      'homeTeamName',
      'homeTeamCountryCode',
      'awayTeamName',
      'awayTeamCountryCode',
      'homeTeamGoals',
      'awayTeamGoals',
      'homeTeamPenalties',
      'awayTeamPenalties',
      'status'
    ];
    return from(
      this.client.get('data', {
        queries: [
          {
            dimensions: columnsToRetrieve.map((colName) => {
              return {
                dataset_id: DATASETS['games'].set,
                column_id: DATASETS['games'].columns[colName].column
              };
            }),
            where: [
              {
                expression: '? = ?',
                parameters: [
                  {
                    dataset_id: DATASETS['games'].set,
                    column_id: DATASETS['games'].columns['phase'].column,
                  },
                  'TOURNAMENT',
                ],
              },
              {
                expression: '? is not null',
                parameters: [
                  {
                    dataset_id: DATASETS['games'].set,
                    column_id: DATASETS['games'].columns['homeTeamCountryCode'].column,
                  }
                ],
              },
              {
                expression: '? is not null',
                parameters: [
                  {
                    dataset_id: DATASETS['games'].set,
                    column_id: DATASETS['games'].columns['awayTeamCountryCode'].column,
                  }
                ],
              }
            ],
            options: {
              rollup_data: false,
              locale_id: 'en',
              timezone_id: 'Europe/Brussels',
            },
          }
        ]
      })
    )
      .pipe(
        tap((result) => {
          this.setCache('games', result);
        })
      );
  }

  retrieveScore(gameId: string): Observable<any> {
    //return observable from cache if available and less than 5 minutes old
    if (this.cache?.[`game-${gameId}`]?.date && (new Date().getTime() - this.cache?.[`game-${gameId}`]?.date.getTime()) < 300000 && this.cache?.[`game-${gameId}`]?.value) {
      return from([this.cache?.[`game-${gameId}`]?.value]);
    }
    const columnsToRetrieve = [
      'id',
      'date',
      'homeTeamName',
      'homeTeamCountryCode',
      'awayTeamName',
      'awayTeamCountryCode',
      'homeTeamGoals',
      'awayTeamGoals',
      'homeTeamPenalties',
      'awayTeamPenalties',
      'status'
    ];
    return from(
      this.client.get('data', {
        queries: [
          {
            dimensions: columnsToRetrieve.map((colName) => {
              return {
                dataset_id: DATASETS['games'].set,
                column_id: DATASETS['games'].columns[colName].column
              };
            }),
            where: [
              {
                expression: '? = ?',
                parameters: [
                  {
                    dataset_id: DATASETS['games'].set,
                    column_id: DATASETS['games'].columns['id'].column,
                  },
                  parseInt(gameId),
                ],
              }
            ],
            options: {
              rollup_data: false,
              locale_id: 'en',
              timezone_id: 'Europe/Brussels',
            },
          }
        ]
      })
    )
      .pipe(
        tap((result) => {
          this.setCache(`game-${gameId}`, result);
        })
      );
  }

  retrieveProbabilitiesDates(): Observable<any> {
    //return observable from cache if available and less than 5 minutes old
    if (this.cache?.['probabilitiesDates']?.date && (new Date().getTime() - this.cache?.['probabilitiesDates']?.date.getTime()) < 300000 && this.cache?.['predictionDates']?.value) {
      return from([this.cache?.['probabilitiesDates']?.value]);
    }
    return from(
      this.client.get('data', {
        queries: [
          {
            dimensions: [{
              dataset_id: DATASETS['tournamentProbabilitiesPerTeam'].set,
              column_id: DATASETS['tournamentProbabilitiesPerTeam'].columns['date'].column
            }],
            options: {
              rollup_data: true,
              locale_id: 'en',
              timezone_id: 'Europe/Brussels',
            },
          }
        ]
      })
    )
      .pipe(
        tap((result) => {
          this.setCache('predictionDates', result);
        })
      );
  }

  retrieveCountryVsCountryPrediction(firstCountry: any, secondCountry: any): Observable<any> {
    //return observable from cache if available and less than 5 minutes old
    const key = `prediction-${firstCountry.key}-${secondCountry.key}`;
    if (this.cache?.[key]?.date && (new Date().getTime() - this.cache?.[key]?.date.getTime()) < 300000 && this.cache?.[key]?.value) {
      return from([this.cache?.[key]?.value]);
    }
    return from(
      this.client.get('data', {
        queries: [
          {
            dimensions: Object.values(DATASETS['headVsHeadpredictions'].columns).map((col) => ({
              dataset_id: col.set,
              column_id: col.column
            })),
            where: [
              {
                expression: '? = ?',
                parameters: [
                  {
                    dataset_id: DATASETS['headVsHeadpredictions'].set,
                    column_id: DATASETS['headVsHeadpredictions'].columns['homeTeam'].column,
                  },
                  firstCountry.key,
                ],
              },
              {
                expression: '? = ?',
                parameters: [
                  {
                    dataset_id: DATASETS['headVsHeadpredictions'].set,
                    column_id: DATASETS['headVsHeadpredictions'].columns['awayTeam'].column,
                  },
                  secondCountry.key,
                ],
              },
            ],
            options: {
              rollup_data: false,
              locale_id: 'en',
              timezone_id: 'Europe/Brussels',
            },
          }
        ]
      })
    )
      .pipe(
        tap((result) => {
          this.setCache(key, result);
        })
      );
  }

  retrievePlayerTournamentDetails(playerId: string): Observable<any> {
    //return observable from cache if available and less than 5 minutes old
    if (this.cache?.[`player-${playerId}`]?.date && (new Date().getTime() - this.cache?.[`player-${playerId}`]?.date.getTime()) < 300000 && this.cache?.[`player-${playerId}`]?.value) {
      return from([this.cache?.[`player-${playerId}`]?.value]);
    }
    const columnsToRetrieve = [
      'id',
      'name',
      'age',
      'height',
      'weight',
      'jerseyNumber',
      'position',
      'countryCode',
      'nationalTeam'
    ];
    return from(
      this.client.get('data', {
        queries: [
          {
            dimensions: columnsToRetrieve.map((colName) => {
              return {
                dataset_id: DATASETS['players'].set,
                column_id: DATASETS['players'].columns[colName].column
              };
            }),
            where: [
              {
                expression: '? = ?',
                parameters: [
                  {
                    dataset_id: DATASETS['players'].set,
                    column_id: DATASETS['players'].columns['playerId'].column,
                  },
                  parseInt(playerId),
                ],
              }
            ],
            options: {
              rollup_data: false,
              locale_id: 'en',
              timezone_id: 'Europe/Brussels',
            },
          }
        ]
      })
    )
      .pipe(
        tap((result) => {
          this.setCache(`game-${playerId}`, result);
        })
      );
  }

  retrieveSquad(countryCode: string): Observable<any> {
    //return observable from cache if available and less than 5 minutes old
    if (this.cache?.[`squad-${countryCode}`]?.date && (new Date().getTime() - this.cache?.[`squad-${countryCode}`]?.date.getTime()) < 300000 && this.cache?.[`squad-${countryCode}`]?.value) {
      return from([this.cache?.[`squad-${countryCode}`]?.value]);
    }
    const columnsToRetrieve = [
      'id',
      'name',
      'countryCode'
    ];
    return from(
      this.client.get('data', {
        queries: [
          {
            dimensions: columnsToRetrieve.map((colName) => {
              return {
                dataset_id: DATASETS['squad'].set,
                column_id: DATASETS['squad'].columns[colName].column
              };
            }),
            where: [
              {
                expression: '? = ?',
                parameters: [
                  {
                    dataset_id: DATASETS['squad'].set,
                    column_id: DATASETS['squad'].columns['countryCode'].column,
                  },
                  countryCode,
                ],
              }
            ],
            options: {
              rollup_data: false,
              locale_id: 'en',
              timezone_id: 'Europe/Brussels',
            },
          }
        ]
      })
    )
      .pipe(
        tap((result) => {
          this.setCache(`squad-${countryCode}`, result);
        })
      );
  }
  

  setCache(key: string, value: any) {
    this.cache[key] = {
      date: new Date(),
      value
    };
  }
}
