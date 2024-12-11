import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, delay } from 'rxjs/operators';
import { DataService } from '../shared/services/data.service';
import { ScrollService } from '../shared/services/scroll.service';
import { DOCUMENT } from '@angular/common';
import { COUNTRIES } from '../shared/constants/countries.constant';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit{
  private readonly dataService = inject(DataService);
  private readonly scrollService = inject(ScrollService);
  private readonly document = inject(DOCUMENT);

  status = { loading: true };
  games: any;
  perDay: any;

  constructor() {
    this.dataService.retrieveGames()
      .pipe(
        takeUntilDestroyed(),
        tap((result) => {
          this.games = result?.data?.map((game: any) => {
            return {
              id: game[0],
              date: game[1],
              time: new Date(game[1]).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' } ),
              homeTeamName: game[2].id,
              homeTeamCountryCode: game[3].id,
              homeTeamIsoCode: COUNTRIES.find((country) => country.key === game[3].id)?.iso,
              awayTeamName: game[4].id,
              awayTeamCountryCode: game[5].id,
              awayTeamIsoCode: COUNTRIES.find((country) => country.key === game[5].id)?.iso,
              homeTeamGoals: game[6],
              awayTeamGoals: game[7],
              homeTeamPenalties: game[8],
              awayTeamPenalties: game[9],
              status: game[10].id
            };
          });
          this.perDay = this.convertGamesArrayToPerDay(this.games);
          this.status.loading = false;
        }),
        // delay to make sure the view is rendered before scrolling
        delay(0),
        tap(() => {
          const firstDayWithGamesUpcoming = this.perDay.find((day: any) => day.games.find((game: any) => game.status === 'UPCOMING'));
          if (firstDayWithGamesUpcoming) {
            const firstDayWithGamesUpcomingElement = this.document.getElementById('d-' + firstDayWithGamesUpcoming.date);
            if (firstDayWithGamesUpcomingElement) {
              this.scrollService.scrollToElement(firstDayWithGamesUpcomingElement);
            }
          }
        })
      )
      .subscribe();
  }

  convertGamesArrayToPerDay(games: any) {
    const perDay = games.reduce((acc: any, game: any) => {
      const date = new Date(game.date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      const dateKey = `${year}-${month < 10 ? '0' + month : month}-${day}`;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({...game, month: month, day: day, year: year });
      return acc;
    }, {});
    // Safari doesn't support some dateFormatting, hence the low level functions
    return Object.keys(perDay).map((key) => {
      return {
        date: key,
        // format date string to locale date string as Sunday December 20 2020
        dateStr: new Date(perDay[key][0].year, perDay[key][0].month-1, perDay[key][0].day).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }),
        games: perDay[key].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    }).sort((a: any, b: any) =>  {
      const aDate = new Date(a?.games?.[0]?.year, (a?.games?.[0]?.month ?? 1) -1, a?.games?.[0]?.day);
      const bDate = new Date(b?.games?.[0]?.year, (b?.games?.[0]?.month ?? 1) -1, b?.games?.[0]?.day);
      return bDate.getTime() - aDate.getTime()
    });
  }

  ngOnInit(): void {
/*     //scroll to the date of today
    const today = new Date().toISOString().substring(0, 10);
    const todayElement = document.getElementById(today);
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } */
  }
}
