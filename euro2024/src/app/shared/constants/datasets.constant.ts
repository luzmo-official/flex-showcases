export type Column = {
  set: string;
  column?: string;
  label: { [locale: string]: string };
  type: string;
  aggregationFunc?: string;
  aggregationWeight?: {
    set: string;
    column: string;
  };
  subtype?: string;
  currency?: string;
  format?: string;
  color?: string;
  formula?: string;
};

export const DATASETS: {
  [dataset: string]: { set: string; columns: { [name: string]: Column } };
} = {
  headVsHeadpredictions: {
    set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
    columns: {
      homeTeam: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: 'fe782883-cf92-4d63-a2bf-6d4fd80beb3d',
        label: { en: 'Home Team' },
        type: 'hierarchy',
      },
      homeOffence: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '03d7f503-9c72-4b28-9f8f-5b068183de35',
        label: { en: 'Home Offence' },
        type: 'numeric',
      },
      homeDefence: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '9fb00893-12cc-4e4f-91b1-30ce87f6d775',
        label: { en: 'Home Defence' },
        type: 'numeric',
      },
      homeRating: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '209167ed-1ca4-4d21-9866-0fe28764fd42',
        label: { en: 'Home Rating' },
        type: 'numeric',
      },
      awayTeam: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '39afc1a3-8a0c-4a69-9e25-13d0e656b729',
        label: { en: 'Away Team' },
        type: 'hierarchy',
      },
      awayOffence: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: 'd8b14980-740f-4a45-8c1e-91e1bf200a6f',
        label: { en: 'Away Offence' },
        type: 'numeric',
      },
      awayDefence: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '486ba653-d073-42fd-8c0a-56a95a25279e',
        label: { en: 'Away Defence' },
        type: 'numeric',
      },
      awayRating: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '2c5c68a8-4671-476c-a2f3-9ad5d1d99d10',
        label: { en: 'Away Rating' },
        type: 'numeric',
      },
      score: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '491c22ca-e4bf-4f69-b821-be6256a33d79',
        label: { en: 'Score' },
        type: 'hierarchy',
      },
      probabilityWinHomeTeam: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '292d4f94-8221-49ea-a94f-2edf8ff0085a',
        label: { en: 'Probability win home team' },
        type: 'numeric',
      },
      probabilityWinAwayTeam: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: 'a99099d7-6134-4043-9b05-46c72f2299d1',
        label: { en: 'Probability win away team' },
        type: 'numeric',
      },
      probabilityDraw: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: 'b77ded40-72e7-474f-9770-3cad5f3dd47b',
        label: { en: 'Probability draw' },
        type: 'numeric',
      },
      streakers: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '5cfbacd6-e4ce-45d5-b382-274616d06163',
        label: { en: 'Streakers' },
        type: 'numeric',
      },
      checks: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: '5392b726-63e6-4c73-b9b5-fa35a0d17a19',
        label: { en: 'VAR Checks' },
        type: 'numeric',
      },
      octopus: {
        set: '3c4062f0-25d1-4ebf-87f3-ce26364415f1',
        column: 'b6e43f25-2489-471b-8861-22beee543444',
        label: { en: 'Octopus' },
        type: 'numeric',
      },
    },
  },
  tournamentProbabilitiesPerTeam: {
    set: '363589ee-2f40-4a28-a5ad-61bb0b5a0b14',
    columns: {
      date: {
        set: '363589ee-2f40-4a28-a5ad-61bb0b5a0b14',
        column: '1ae11b59-5d72-4bf7-80f7-b66292439f2a',
        label: { en: 'Team' },
        type: 'datetime',
      },
      currentPrediction: {
        set: '363589ee-2f40-4a28-a5ad-61bb0b5a0b14',
        column: '548d9df0-5249-4423-8fc7-ecdcb26b87f5',
        label: { en: 'Current prediction' },
        type: 'hierarchy',
      },
      countryCode: {
        set: '363589ee-2f40-4a28-a5ad-61bb0b5a0b14',
        column: '207af866-ebde-41c9-b1cc-508d1460c07c',
        label: { en: 'Team' },
        type: 'hierarchy',
      },
      phase: {
        set: '363589ee-2f40-4a28-a5ad-61bb0b5a0b14',
        column: '13261b09-f5f8-4035-9d77-ef76187c5ed9',
        label: { en: 'Phase' },
        type: 'hierarchy',
      },
      probability: {
        set: '363589ee-2f40-4a28-a5ad-61bb0b5a0b14',
        column: '9ded79dc-1967-4c3a-a147-f61ba486ee72',
        label: { en: 'Probability' },
        type: 'numeric',
        format: '.1a%',
      },
    },
  },
  players: {
    set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
    columns: {
      cards: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'de8c21a1-b90e-4ae5-80c9-cb2208e072f5',
        label: { en: 'Cards' },
        type: 'numeric',
        aggregationFunc: 'sum',
        format: '.0af',
      },
      redCards: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '19944da7-3931-45a8-becd-266ac471a8f6',
        label: {
          en: 'Red cards',
        },
        color: '#d12713',
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      yellowCards: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'c9bed979-9ebf-46ae-a719-082ffcdb9560',
        label: {
          en: 'Yellow cards',
        },
        color: '#f8c20c',
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      foulsSuffered: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '4e53b8c8-660a-4382-83da-a04beda16152',
        label: {
          en: 'Fouls suffered',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      foulsCommitted: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '818a8260-8d4c-4f30-87f9-70ab7bc67e24',
        label: {
          en: 'Fouls committed',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      cleanSheets: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '9db6cf2b-dcef-4913-a1a1-47f834b83190',
        label: {
          en: 'Clean sheet',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      savesOnPenalty: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'b60952ab-334b-4f76-bb67-8a24faad9bca',
        label: {
          en: 'Saves on penalty',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      ownGoalsConceded: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'e69affc0-be19-45e8-bac6-b4301129357b',
        label: {
          en: 'Own goal conceded',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      goalsConceded: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'e0e3910b-6611-43d8-9062-109c94f0c434',
        label: {
          en: 'Goals conceded',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      saves: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '1b5ee2ed-485a-41d9-9e5b-bfc5716cba0b',
        label: {
          en: 'Saves',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      clearanceAttempted: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '7bfce4be-abb5-4206-8d20-1e60260ace05',
        label: {
          en: 'Clearance attempted',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      tackles: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'aab9e784-32be-46aa-a985-a50ba353b108',
        label: {
          en: 'Tackles',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      recoveredBalls: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '3f376622-e78a-4519-b6ed-389591b66473',
        label: {
          en: 'Recovered balls',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      assists: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '53275dfe-9ee4-4420-929b-892c6faf682d',
        label: {
          en: 'Assists',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      crossCompleted: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '1435d090-181c-4492-a6f2-aad2c775f404',
        label: {
          en: 'Cross completed',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      offsides: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '4e6ca1b6-d8e0-45e1-9444-928a3931764b',
        label: {
          en: 'Offsides',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      corners: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '44cc4f99-21cf-4df3-ac13-76449181845e',
        label: {
          en: 'Corners',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      freeKick: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '7bb64ad7-81a6-433f-bf8a-2d788bfa3004',
        label: {
          en: 'Free kick',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      crossAttempted: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'a1e7efe8-22ca-404f-8fb5-4574d6dcb70b',
        label: {
          en: 'Cross attempted',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      crossAccuracy: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '804a3cca-b7de-4ca9-a96e-7d410efab1be',
        label: {
          en: 'Cross accuracy',
        },
        type: 'numeric',
        format: '.2af',
        aggregationFunc: 'sum',
      },
      attemptsBlocked: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '6a350cd9-b155-4f9e-be03-825f49c66107',
        label: {
          en: 'Attempts blocked',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      passesCompleted: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'e88b0218-831a-45c7-a6e2-1a69834dede7',
        label: {
          en: 'Passes completed',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      passesAttempted: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'e7a44088-0eb7-49af-bd6e-d66f1effb6ee',
        label: {
          en: 'Passes attempted',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      associationLogo: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '7da76867-2e1e-4673-bbfa-6ff333ef45ff',
        label: {
          en: 'Association logo',
        },
        type: 'hierarchy',
      },
      passesAccuracy: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'aaccee0d-5d3c-4f92-a09c-7120cd75fce9',
        label: {
          en: 'Passes accuracy',
        },
        type: 'numeric',
        format: '.2af',
        aggregationFunc: 'sum',
      },
      attemptsOffTarget: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '97894516-a6a9-43ce-9374-5aeb7313043b',
        label: {
          en: 'Attempts off target',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      attempts: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '5647eb5d-39a9-4e01-8813-19e5d460f4e3',
        label: {
          en: 'Attempts',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      attemptsOnTarget: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'ef792fcc-712a-43f9-b808-23045c445b3e',
        label: {
          en: 'Attempts on target',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      goals: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'f8bfcbe4-8553-4f3e-83f3-f1641d2ddf78',
        label: {
          en: 'Goals',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      matchesAppearances: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '09f35115-ff1e-4d2a-8448-d8c05159394f',
        label: {
          en: 'Matches appearances',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      nationalTeam: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'd2d8fa94-adfb-421a-82af-f659e7933e75',
        label: {
          en: 'National team',
        },
        type: 'hierarchy',
      },
      countryCode: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '988fedc4-3d08-40f5-b0d5-aa3742502485',
        label: {
          en: 'Country code',
        },
        type: 'hierarchy',
      },
      clubJerseyNumber: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '0b5e76be-b2bd-42a6-b319-17c1522d49de',
        label: {
          en: 'Club jersey number',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      jerseyNumber: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'e9f841bf-adb9-49b4-a53d-e7e45d3227ed',
        label: {
          en: 'Jersey number',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      detailedPosition: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '865dc940-4894-49eb-9d47-7415a389dd2a',
        label: {
          en: 'Detailed position',
        },
        type: 'hierarchy',
      },
      clubPosition: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'f550e836-0f6e-4e3b-9380-48d5c96819db',
        label: {
          en: 'Club position',
        },
        type: 'hierarchy',
      },
      position: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '4c43c741-7ce1-4d7b-b39c-26b23cd05e7f',
        label: {
          en: 'Position',
        },
        type: 'hierarchy',
      },
      picture: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '87c9124c-5ae9-446c-8606-d0fe1d4f361c',
        label: {
          en: 'Picture',
        },
        type: 'hierarchy',
      },
      clubId: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '069855bb-0218-4bbd-af7e-44f2d3b3c2f3',
        label: {
          en: 'Club id',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      teamId: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '68164bb0-f7ca-4e4f-9491-8d99e2aa2dd2',
        label: {
          en: 'Team id',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      weight: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '2888c747-3d8e-41c1-8ca6-aedc6589408b',
        label: {
          en: 'Weight',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'average',
      },
      height: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '849ea797-3b61-4f70-a572-0d3a816c5309',
        label: {
          en: 'Height',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'average',
      },
      age: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'b11a5070-ce2c-40d1-8293-5bf995153e97',
        label: {
          en: 'Age',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'average',
      },
      birthDate: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '1152bd64-ac46-4780-bf38-edee94e89789',
        label: {
          en: 'Birthdate',
        },
        type: 'datetime',
        format: '%amd~%Y',
      },
      name: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '4f696998-2fd4-4880-a978-56bdec0c4f56',
        label: {
          en: 'Name',
        },
        type: 'hierarchy',
      },
      playerId: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '06039008-db89-4fdf-a440-77fd4d1f6cba',
        label: {
          en: 'Playerid',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      phase: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: '673138c1-9f79-4a0c-bf96-412377a5ca40',
        label: {
          en: 'Phase',
        },
        type: 'hierarchy',
      },
      id: {
        set: '97fb82d0-e7aa-4221-8f6e-a410014291b7',
        column: 'cc498800-a6bd-46df-80d3-5fcbec30c977',
        label: {
          en: 'Id',
        },
        type: 'hierarchy',
      },
    },
  },
  games: {
    set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
    columns: {
      awayTeamPenalties: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '1e87639e-6a8a-4a3a-a8c4-50babc5cf6e8',
        label: {
          en: 'Away team penalties',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      homeTeamPenalties: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: 'ae59d947-d9b2-40e0-abae-6a6afbec1da2',
        label: {
          en: 'Home team penalties',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      awayTeamGoals: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '234c2cc2-fbbe-4727-9864-806a490d9754',
        label: {
          en: 'Away team score',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      homeTeamGoals: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '64644cb4-e132-4c51-b745-f6aafb64f2a1',
        label: {
          en: 'Home team score',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      status: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: 'f51f43d9-83ec-4663-9962-04ec9b381fe7',
        label: {
          en: 'Status',
        },
        type: 'hierarchy',
      },
      result: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '9c1ed5f8-9e0e-4955-92b3-cb0b3803235b',
        label: {
          en: 'Result',
        },
        type: 'hierarchy',
      },
      matchAttendance: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: 'dbf50219-c938-40fc-8c56-8ae49b963260',
        label: {
          en: 'Match attendance',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      type: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: 'ab5a8a84-22e1-4168-b9b9-dd611c62ddd5',
        label: {
          en: 'Type',
        },
        type: 'hierarchy',
      },
      date: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '8da228f7-f8ad-4946-9782-26d46634702e',
        label: {
          en: 'Date',
        },
        type: 'datetime',
        format: '%amd~%Y %H:%M:%S.%L',
      },
      awayTeamName: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '1ac3c7a0-fc35-42c1-bf2f-8e159a574800',
        label: {
          en: 'Away team',
        },
        type: 'hierarchy',
      },
      awayTeamCountryCode: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '9abec783-3b83-4a16-8366-f01df5a86b45',
        label: {
          en: 'Away team country code',
        },
        type: 'hierarchy',
      },
      homeTeamName: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: 'fbca2c9c-46c7-41e7-8b13-397f73bd245c',
        label: {
          en: 'Home team',
        },
        type: 'hierarchy',
      },
      homeTeamCountryCode: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '2c9346d3-b60e-4839-b8d3-8e3f3aacbf8c',
        label: {
          en: 'Home team country code',
        },
        type: 'hierarchy',
      },
      phase: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '214b10dd-7fb5-4a5c-a08e-13fd8e2e51c1',
        label: {
          en: 'Phase',
        },
        type: 'hierarchy',
      },
      id: {
        set: '031eca54-80f6-4cf0-8c72-66e6699d55c4',
        column: '101c0215-fd30-41a6-857e-0fd0dd2b7165',
        label: {
          en: 'id',
        },
        type: 'numeric',
        format: '.0af',
      },
    },
  },
  teams: {
    set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
    columns: {
      redCards: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '9fa9f303-4a8c-409a-8bdc-799f50727dd7',
        label: {
          en: 'Red cards',
        },
        type: 'numeric',
        format: '.0af',
        color: '#d12713',
        aggregationFunc: 'sum',
      },
      yellowCards: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '60e2c9e3-6206-40b9-b4cd-3c1b14e050dd',
        label: {
          en: 'Yellow cards',
        },
        type: 'numeric',
        format: '.0af',
        color: '#f8c20c',
        aggregationFunc: 'sum',
      },
      foulsSuffered: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '91cefa81-b5d7-428e-8726-568b2baaa7b8',
        label: {
          en: 'Fouls suffered',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      foulsCommitted: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '9a7eb6b9-5a1e-44f0-83ce-1ed8a5bb3b9d',
        label: {
          en: 'Fouls committed',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      cleanSheets: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'cfb5e8df-701a-4da0-a870-686f7a209882',
        label: {
          en: 'Clean sheets',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      savesOnPenalty: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'f22707da-9be1-4dd6-bb2c-a0a41eb0a801',
        label: {
          en: 'Saved penalties',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      ownGoalsConceded: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'd10e9498-494e-4486-a1b0-d1a37f6a333b',
        label: {
          en: 'Own goals conceded',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      goalsConceded: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '1ed70e2e-819f-42f5-bf3b-44c30f5de963',
        label: {
          en: 'Goals conceded',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      saves: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '302bb600-918a-495f-82e8-95b2cb0e059d',
        label: {
          en: 'Saves',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      tackles: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '18dce4bb-564b-4985-9aa8-b31ac57c85fd',
        label: {
          en: 'Tackles',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      clearanceAttempted: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '112f321a-ff80-4e71-bf8f-efb3db1c3c7d',
        label: {
          en: 'Clearance attempted',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      offsides: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'eccc0a6b-caa9-4e72-8e99-1cf9503123ab',
        label: {
          en: 'Offsides',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      recoveredBalls: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '4f94c471-de55-4b88-8225-e090494c6993',
        label: {
          en: 'Recovered balls',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      corners: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '1b0b46b7-a937-4408-9e3a-aa5cad51c6dc',
        label: {
          en: 'Corners',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      assists: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '02c0156a-ca67-4cbc-9697-fefa57c7955e',
        label: {
          en: 'Assists',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      attacks: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '13897fb6-b270-4007-8a94-1f1815fc1f71',
        label: {
          en: 'Attacks',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      freeKick: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '30db747c-3244-4f05-a929-43125490e103',
        label: {
          en: 'Free kicks',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      crossCompleted: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '34d3f12a-fa3d-43e1-9b53-85374d7abeca',
        label: {
          en: 'Crosses completed',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      crossAttempted: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '50a9e33f-f0f2-4126-b4f2-ac04fa9c55ae',
        label: {
          en: 'Crosses attempted',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      crossAccuracy: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'b3e64d01-080f-4f11-bd74-08d8da963a8b',
        label: {
          en: 'Cross accuracy',
        },
        type: 'numeric',
        format: '.2af',
        aggregationFunc: 'sum',
      },
      ballPossession: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'b02078fd-7a49-4576-acea-3aec46455b81',
        label: {
          en: 'Ball possession',
        },
        type: 'numeric',
        format: '.2af',
        aggregationFunc: 'sum',
      },
      passesCompleted: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'dc3d396b-15da-4266-9c8d-ddf21d282534',
        label: {
          en: 'Passes completed',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      passesAttempted: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '85365833-f370-4258-a744-5c2caa65b855',
        label: {
          en: 'Passes attempted',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      passAccuracy: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '01109417-ea48-4e0f-8987-17c7de9c643a',
        label: {
          en: 'Passes accuracy',
        },
        type: 'numeric',
        format: '.2af',
        aggregationFunc: 'sum',
      },
      attemptsBlocked: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '3c83e8d0-7062-4a74-9770-14f1f9a0bb94',
        label: {
          en: 'Attempts blocked',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      attemptsOffTarget: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'cca8c2d4-3ef5-42c6-801a-41f203b06a60',
        label: {
          en: 'Attempts off target',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      attemptsOnTarget: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'bbb8b755-d1e1-4f61-ad01-2c391693b714',
        label: {
          en: 'Attempts on target',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      attempts: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'a9eec6e6-49dc-4952-9484-e904b24dc681',
        label: {
          en: 'Attempts',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      goals: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '96ae7bd6-360d-4aff-8ade-6df310ad3172',
        label: {
          en: 'Goals',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      losses: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'd9474ca7-708c-409d-83ee-2b8d01b43f80',
        label: {
          en: 'Losses',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      draws: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '06f3e2c5-1335-43e8-b2e3-fbc2476dad58',
        label: {
          en: 'Draws',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      wins: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'fd64010d-a529-43c5-a22d-cc0095f32e09',
        label: {
          en: 'Wins',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      matches: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '52db9a4e-37dc-4f07-baaf-04ad7cd29cb1',
        label: {
          en: 'Matches',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      associationLogo: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '3087fd7a-ec1f-436d-abd2-530549e271cd',
        label: {
          en: 'Association logo',
        },
        type: 'hierarchy',
      },
      countryCode: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'f5f61425-bdb5-46a2-afdc-fe3cb8e9d8fb',
        label: {
          en: 'Country code',
        },
        type: 'hierarchy',
      },
      name: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'e12fd646-7942-41e2-8a40-0c70e8daa5a3',
        label: {
          en: 'Name',
        },
        type: 'hierarchy',
      },
      teamId: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '6ba0b011-4dc2-4e6e-a80a-aeb4c9d40cee',
        label: {
          en: 'Team Id',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      teamcode: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '307602d5-8cfa-48a7-a73d-04df80c6e644',
        label: {
          en: 'Teamcode',
        },
        type: 'hierarchy',
      },
      phase: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: 'ff01bade-7b3b-4937-8e48-beb780e77112',
        label: {
          en: 'Phase',
        },
        type: 'hierarchy',
      },
      id: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        column: '77b219d6-ee07-4c41-a052-245f0ba9e315',
        label: {
          en: 'Id',
        },
        type: 'hierarchy',
      },
      goalsPerGame: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        formula: '2867d2f1-4a48-4569-a7dc-b2d23e02766a',
        label: { en: 'Goals per game' },
        type: 'numeric',
        format: '.1af',
      },
      goalsConcededPerGame: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        formula: '05cd787e-4014-40d3-aab0-a81f3d6deda0',
        label: { en: 'Goals conceded per game' },
        type: 'numeric',
        format: '.1af',
      },
      attemptsPerGame: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        formula: '30cbef09-1d6c-4a43-9973-93525a3e4979',
        label: { en: 'Attempts per game' },
        type: 'numeric',
        format: '.1af',
      },
      passesAccuracyPercentage: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        formula: '457f8b6c-2994-404f-9c4e-2e34ac85cbed',
        label: { en: 'Passes accuracy' },
        type: 'numeric',
        aggregationFunc: 'average',
        format: '.0a%',
      },
      ballPossessionPercentage: {
        set: '30ee4df6-b311-4774-bbbd-3bdc52753f4a',
        formula: '2180245d-ede2-4bc3-b3f8-49c2e0a25baf',
        label: { en: 'Ball possession' },
        type: 'numeric',
        aggregationFunc: 'average',
        format: '.0a%',
      },
    },
  },
  squad: {
    set: '82175f34-63c7-429e-9d12-d9cd8345f8cc',
    columns: {
      id: {
        set: '82175f34-63c7-429e-9d12-d9cd8345f8cc',
        column: 'ef576234-c2f2-4482-b0f3-20fd81cff4fe',
        label: {
          en: 'Id',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      name: {
        set: '82175f34-63c7-429e-9d12-d9cd8345f8cc',
        column: '9c8b2859-e186-4009-8a64-25b2c715312c',
        label: {
          en: 'Name',
        },
        type: 'hierarchy',
      },
      age: {
        set: '82175f34-63c7-429e-9d12-d9cd8345f8cc',
        column: '2ab2046f-6b13-4aad-9b09-89293b560bf9',
        label: {
          en: 'Age',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      countryCode: {
        set: '82175f34-63c7-429e-9d12-d9cd8345f8cc',
        column: '7bba0088-98b8-49c1-834f-879ed1dc20fe',
        label: {
          en: 'Country code',
        },
        type: 'hierarchy',
      },
    },
  },
  marketValue: {
    set: 'efc00754-1825-41a7-8514-3702c722d142',
    columns: {
      id: {
        set: 'efc00754-1825-41a7-8514-3702c722d142',
        column: '101ac39d-572d-423a-a3af-8251df17450d',
        label: {
          en: 'Id',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      name: {
        set: 'efc00754-1825-41a7-8514-3702c722d142',
        column: 'a332f774-1b2f-41e1-af12-3aa23d3e2ff1',
        label: {
          en: 'Name',
        },
        type: 'hierarchy',
      },
      countryCode: {
        set: 'efc00754-1825-41a7-8514-3702c722d142',
        column: '93e4b98f-818e-4930-bb64-00dbfc8387bd',
        label: {
          en: 'Country code',
        },
        type: 'hierarchy',
      },
      marketValue: {
        set: 'efc00754-1825-41a7-8514-3702c722d142',
        column: '824e5595-aaf8-40f2-8b45-a2f592e47767',
        label: {
          en: 'Market value',
        },
        type: 'numeric',
        subtype: 'currency',
        format: ',.2as',
        currency: '€',
        aggregationFunc: 'sum',
      },
      club: {
        set: 'efc00754-1825-41a7-8514-3702c722d142',
        column: '256a8f10-067f-4b32-ad0c-6cb0e768c963',
        label: {
          en: 'Club',
        },
        type: 'hierarchy',
      },
    },
  },
  eaProfiles: {
    set:'d37627f5-ba09-4cb1-8394-f6d649f89c05',
    columns: {
      id: {
        set: 'd37627f5-ba09-4cb1-8394-f6d649f89c05',
        column: '52160597-4f46-48ce-a84d-45472ace8fce',
        label: {
          en: 'Id',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      countryCode: {
        set: 'd37627f5-ba09-4cb1-8394-f6d649f89c05',
        column: '39dd2492-b9a8-4d10-8315-da4e7d6930a6',
        label: {
          en: 'Country code',
        },
        type: 'hierarchy',
      },
      name: {
        set: 'd37627f5-ba09-4cb1-8394-f6d649f89c05',
        column: '50fa145c-4db7-4485-b29e-a39ea84639c6',
        label: {
          en: 'Name',
        },
        type: 'hierarchy',
      },
      clubName: {
        set: 'd37627f5-ba09-4cb1-8394-f6d649f89c05',
        column: '5a30be3f-ce60-4e2d-8e0e-e8d4bd4525c8',
        label: {
          en: 'Club name',
        },
        type: 'hierarchy',
      },
      overallScore: {
        set: 'd37627f5-ba09-4cb1-8394-f6d649f89c05',
        column: '0beb2b37-84b1-421f-9e40-01dfffdb0bc4',
        label: {
          en: 'EA Sports FC Overall score',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      }
    }
  },
  eaProfilesTransposed: {
    set: 'b473cd18-a525-40be-b3cc-05e1b57970a1',
    columns: {
      id: {
        set: 'b473cd18-a525-40be-b3cc-05e1b57970a1',
        column: '9fc58764-0c6c-40d1-96f2-6c1f238f3cc2',
        label: {
          en: 'Id',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'sum',
      },
      statName: {
        set: 'b473cd18-a525-40be-b3cc-05e1b57970a1',
        column: '66e6e5c3-00b8-49fb-b063-fe3c2b6fbc9b',
        label: {
          en: 'Category',
        },
        type: 'hierarchy',
      },
      value: {
        set: 'b473cd18-a525-40be-b3cc-05e1b57970a1',
        column: '5914ab88-244a-41e7-ab26-49861c1f7df3',
        label: {
          en: 'Value',
        },
        type: 'numeric',
        format: '.0af',
        aggregationFunc: 'average',
      }
    }
  }
};
