import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COUNTRIES, Country } from '../shared/constants/countries.constant';
import { HeadToHeadCountriesOffenseComponent } from './head-to-head-countries-offense/head-to-head-countries-offense.component';
import { HeadToHeadCountriesDefenseComponent } from './head-to-head-countries-defense/head-to-head-countries-defense.component';
import { HeadToHeadCountriesKeeperComponent } from './head-to-head-countries-keeper/head-to-head-countries-keeper.component';
import { HeadToHeadCountriesTeamComponent } from './head-to-head-countries-team/head-to-head-countries-team.component';
import { MatMenuModule } from '@angular/material/menu';
import { DataService } from '../shared/services/data.service';
import { Meta, Title } from '@angular/platform-browser';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-per-country',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    MatIconModule,
    MatMenuModule,
    HeadToHeadCountriesOffenseComponent,
    HeadToHeadCountriesDefenseComponent,
    HeadToHeadCountriesKeeperComponent,
    HeadToHeadCountriesTeamComponent
  ],
  templateUrl: './country-vs-country.component.html',
  styleUrl: './country-vs-country.component.scss',
})
export class CountryVsCountryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly dataService = inject(DataService);

  countries: Country[] = COUNTRIES.sort((a: Country, b: Country) => a.title.localeCompare(b.title));
  firstCountry!: Country;
  secondCountry!: Country;
  activeTab = 'team';
  aiPrediction!: string;
  gameId: string | undefined;
  gameAlreadyPlayed = false;
  gameSummary: string | undefined;
  prediction: any;
  tabs = [
    { key: 'team', title: 'Team' },
    { key: 'offense', title: 'Attack' },
    { key: 'defense', title: 'Defense' },
    { key: 'keeper', title: 'Keeper' }
  ];
  status = { loading: true, loadingScore: true };

  constructor() {
    this.route.params
      .pipe(
        takeUntilDestroyed(),
        withLatestFrom(this.route.queryParams),
        map(([routeParams, queryParams]) => {
          const param = routeParams['id'];
          const countries = param.split('-vs-');
          const firstCountry = this.countries.find(c => c.key === countries[0]) ?? this.countries[0];
          this.firstCountry = firstCountry;
          const secondCountry = this.countries.find(c => c.key === countries[1]) ?? this.countries[1];
          this.secondCountry = secondCountry;
          const title = `${this.firstCountry.title} vs ${this.secondCountry.title}: Who would win?`;
          this.title.setTitle(title);
          const description = `Compare ${this.firstCountry.title} vs ${this.secondCountry.title} in terms of EURO 2024 team, attack, defense, and keeper stats. Who would win? Built with Luzmo - embedded analytics in your software.`;
          this.meta.updateTag({ name: 'og:title', content: title });
          this.meta.updateTag({ name: 'twitter:title', content: title });
          this.meta.updateTag({ name: 'description', content: description });
          this.meta.updateTag({ name: 'og:description', content: description });
          this.meta.updateTag({ name: 'twitter:description', content: description });

          this.gameId = queryParams['gameId'];
          return { firstCountry, secondCountry };
        }),
        switchMap(({ firstCountry, secondCountry }) => {
          this.status.loading = true;
          return this.dataService.retrieveCountryVsCountryPrediction(firstCountry, secondCountry);
        }),
        switchMap((result) => {
          this.prediction = result?.data?.[0];
          if (this.gameId) {
            return this.dataService.retrieveScore(this.gameId);
          } else {
            return of(null);
          }
        }),
        map((result) => {
          this.aiPrediction = this.createOctopusMessage(this.prediction, result?.data?.[0]);
          this.status.loading = false;
        })
      )
      .subscribe();
  }

  setTab(tabKey: string) {
    this.activeTab = tabKey;
  }

  onCountryChanged(country: Country, firstOrSecond: 'first' | 'second'): void {
    if (firstOrSecond === 'first') {
      this.firstCountry = { ...this.countries.find(c => c.key === country.key)! };
    }
    else if (firstOrSecond === 'second') {
      this.secondCountry = { ...this.countries.find(c => c.key === country.key)! };
    }

    this.router.navigate([`compare/${this.firstCountry.key}-vs-${this.secondCountry.key}`]);
  }

  createPunditPredictionMessage(
    result: any,
    prediction: any
  ) {
    let type: 'winLose' | 'draw' = 'winLose';
    let endResult = 'win';
    let winner = '';
    let loser = '';
    let correct = false;

    const homeCountry = result[2].id;
    const awayCountry = result[4].id;

    const winPercentage = Math.round(prediction[9] * 100);
    const losePercentage = Math.round(prediction[10] * 100);
    const drawPercentage = 100 - winPercentage - losePercentage;

    const predictedResult = [
      { key:'win', value: winPercentage},
      { key:'lose', value: losePercentage},
      { key:'draw', value: drawPercentage}
    ].sort((a, b) => b.value - a.value)[0].key;
    const predictedType: 'winLose' | 'draw' = predictedResult === 'draw' ? 'draw' : 'winLose';
    let predictedWinner = predictedResult === 'lose' ? awayCountry : homeCountry;
    let predictedLoser = predictedResult !== 'lose' ? awayCountry : homeCountry;

    const resultsGoalsHomeTeam = result[6];
    const resultsGoalsAwayTeam = result[7];
    const resultsPenaltiesHomeTeam = result[8];
    const resultsPenaltiesAwayTeam = result[9];
    const predictionGoalsHomeTeam = prediction[8].id.split(' - ')[0];
    const predictionGoalsAwayTeam = prediction[8].id.split(' - ')[1];
    const predictionPenaltiesHomeTeam = 0;
    const predictionPenaltiesAwayTeam = 0;

    endResult = (resultsGoalsHomeTeam > resultsGoalsAwayTeam || resultsGoalsHomeTeam === resultsGoalsAwayTeam && resultsPenaltiesHomeTeam > resultsPenaltiesAwayTeam)
      ? 'win'
      : ((resultsGoalsHomeTeam < resultsGoalsAwayTeam || resultsGoalsHomeTeam === resultsGoalsAwayTeam && resultsPenaltiesHomeTeam < resultsPenaltiesAwayTeam)
        ? 'lose'
        : 'draw');



    if (endResult === 'win') {
      type = 'winLose';
      winner = homeCountry;
      loser = awayCountry;
      if (predictedResult === 'win') {
        correct = true;
      } else {
        correct = false;
      }
    } else if (endResult === 'lose') {
      type = 'winLose';
      winner = awayCountry;
      loser = homeCountry;
      if (predictedResult === 'lose') {
        correct = true;
      } else {
        correct = false;
      }
    } else {
      type = 'draw';
      if (predictedResult === 'draw') {
        correct = true;
      } else {
        correct = false;
      }
    }

    const evenCorrectScore = correct && resultsGoalsHomeTeam === predictionGoalsHomeTeam && resultsGoalsAwayTeam === predictionGoalsAwayTeam;

    const messages = {
      winLose: {
        correct: {
          winLose: [
            `Guess who called <b>${winner}</b>'s victory over ${loser}? This octopundit, that's who!</b>`,
            `I knew it! <b>${winner}</b> swimming past ${loser} was as clear as a crystal ball in my tank.`,
            `<b>${winner}</b> defeating ${loser}? Easy prediction for an octopus with eight tentacles and twice the intuition!`,
            `<b>${winner}</b> over ${loser}? Nailed it like a barnacle on a ship’s hull!`,
            `<b>${winner}</b> winning against ${loser} was obvious—I'm practically a fortune-telling cephalopod!`
          ],
          draw: []
        },
        incorrect: {
          winLose: [
            `Oops, my tentacle slipped! I thought ${loser} would outplay ${winner}.`,
            `Turns out my crystal ball was foggy—I mistakenly predicted ${loser} would ink out ${winner}.`,
            `I might have had one too many krill; I saw ${loser} beating ${winner}, but I was way off!`,
            `My bad, folks. I was sure ${loser} would net a win against ${winner}, but I missed that catch.`,
            `Well, you can't win them all! I thought ${loser} would cheese their way past ${winner}, but I was wrong.`
          ],
          draw: [
            `Looks like I overestimated my psychic skills—I predicted a draw between ${homeCountry} and ${awayCountry}, but ${winner} clinched it.`,
            `Oops, my tentacle senses failed me. I thought ${homeCountry} and ${awayCountry} would end in a draw, but ${winner} swam ahead.`,
            `I had my ink on a tie between ${homeCountry} and ${awayCountry}, but ${winner} took the win—my bad!`,
            `Missed the mark on this one! I predicted a draw between ${homeCountry} and ${awayCountry}, but ${winner} came out on top.`,
            `I foresaw a stalemate between ${homeCountry} and ${awayCountry}, but ${winner} proved me wrong!`
          ]
        }
      },
      draw: {
        correct: {
          draw: [
          `I knew it! ${homeCountry} and ${awayCountry} couldn't settle it in the game, just like I foresaw the draw.`,
          `Germany and ${awayCountry} in a stalemate? This octopus saw that coming from a nautical mile away!`,
          `${homeCountry} and ${awayCountry} ended in a draw, exactly as this tentacled prognosticator predicted.`,
          `Portugal and ${awayCountry} were destined for a tie—called it with my eight-legged insight!`,
          `A draw between ${homeCountry} and ${awayCountry}? That's why they call me the octopus oracle!`,
          ],
          winLose: []
        },
        incorrect: {
          winLose: [
            `I thought ${predictedWinner} would swim past ${predictedLoser}, but they ended up tied —my bad!`,
            `Looks like my crystal ball was foggy—I predicted ${predictedWinner} to beat ${predictedLoser}, but they settled for a draw.`,
            `Oops, my tentacles missed the mark! I foresaw ${predictedWinner} triumphing over ${predictedLoser}, but the game ended in a stalemate.`,
            `My mistake! I called a win for ${predictedWinner} against ${predictedLoser}, but they couldn't break the deadlock.`,
            `I must've had one too many krill; I predicted ${predictedWinner} would defeat ${predictedLoser}, but they ended up tying.`
          ],
          draw: []
        }
      }
    }
    
    const message = [ messages[type][correct ? 'correct' : 'incorrect'][predictedType][Math.floor(Math.random() * 5)] + ' ' ];
    if (evenCorrectScore) {
      message.push(`And I even got the score right!`);
    } else {
      message.push(`The final score was ${resultsGoalsHomeTeam} ${ typeof resultsPenaltiesHomeTeam === 'number' ? '(' + resultsPenaltiesHomeTeam + ') ' :' '}-${resultsGoalsAwayTeam}  ${ typeof resultsPenaltiesAwayTeam === 'number' ? '(' + resultsPenaltiesAwayTeam + ')' :''}.`);
    }

    return message.join('');
  }

  createOctopusMessage(prediction: any, gameData: any) {  
    let message = [];
    const winPr = Math.round(prediction[9] * 100);
    const losePr = Math.round(prediction[10] * 100);
    const drawPr = 100 - winPr - losePr;

    if (typeof(gameData?.[6]) === 'number' && typeof(gameData?.[7]) === 'number' && gameData?.[10]?.id === 'FINISHED') {
      this.gameAlreadyPlayed = true;
      message.push(this.createPunditPredictionMessage(gameData, prediction));
    } else {
      this.gameAlreadyPlayed = false;
      if (prediction[14] && prediction[14].id) {
        message.push(prediction[14].id);
      }
      else { 
        if (prediction[5] > prediction[2] + 1) {
          message.push(`${this.secondCountry.title}'s attacks will hammer the ${this.firstCountry.title} defenders.`);
        }
        else if (prediction[5] < prediction[2] - 1) {
          message.push(`${this.firstCountry.title} defences should have no problem with ${this.secondCountry.title}'s attacks.`);
        }
        if (prediction[1] < prediction[6] - 1) {
          message.push(`I expect ${this.firstCountry.title} to have a hard time scoring against ${this.secondCountry.title}.`);
        }
        else if (prediction[1] > prediction[6] + 1) {
          message.push(`${this.secondCountry.title} will overrun the opponent's wall.`);
        }
  
        if (winPr > 60) {
          message.push(`${this.firstCountry.title} is clear favorite to win this match with a ${winPr}% chance of winning. ${this.secondCountry.title} has only a ${losePr}% chance of winning.`);
        }
        else if (losePr > 60) {
          message.push(`${this.secondCountry.title} is clear favorite to win this match with a ${losePr}% chance of winning. ${this.firstCountry.title} will have to survive: I give them only a ${winPr}% chance of winning.`);
        } 
        else {
          message.push(`I put ${this.firstCountry.title} at ${winPr}% win probability and ${this.secondCountry.title} at ${losePr}%. In ${drawPr}%, it's a toss-up.`);
        }
  
        const score = prediction[8].id.split(' - ');
        if (score[0] === score[1] && drawPr < winPr && drawPr < losePr) {
          message.push(`Despite those odds, the most likely individual score is <b class="text-nowrap">${prediction[8].id}</b>.`);
        }
        else {
          const rand = Math.random();
          if (rand < 0.3) {
            message.push(`I predict a <b class="text-nowrap">${prediction[8].id}</b>.`);
          }
          else if (rand < 0.6) {
            message.push(`I feel a <b class="text-nowrap">${prediction[8].id}</b>.`);
          }
          else if (rand < 0.8) {
            message.push(`The most likely outcome is <b class="text-nowrap">${prediction[8].id}</b>.`);
          }
          else {
            message.push(`The score should end up <b class="text-nowrap">${prediction[8].id}</b>.`);
          }
        }
  
        if (prediction[3] > 8 && prediction[7] > 8) {
          message.push(`This match is one of the most exciting match-ups of the tournament. Don't miss it!`);
        }
        else if (prediction[3] > 7 && prediction[7] > 7) {
          message.push(`This should prove to be an interesting match to follow.`);
        }
        else if (prediction[3] < 6 && prediction[7] < 6) {
          message.push(`I'll head back to my bowl, as this match is going to be a doozy.`);
        }
  
        if (prediction[13] > 0) {
          message.push(`The game could get hot, as I do foresee ${prediction[13]} VAR Check${prediction[13] > 1 ? 's' : ''} in this match.`);
        }
  
        if (prediction[12] > 0) {
          message.push('High probability of a streaker on the pitch!');
        }
      }
    }

    return message.join(' ');
  }
}
