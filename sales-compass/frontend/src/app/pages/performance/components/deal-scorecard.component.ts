import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemFilterGroup } from '@luzmo/dashboard-contents-types';
import { luzmoClose } from '@luzmo/icons';
import '@luzmo/lucero/picker';
import { NgxLuzmoDashboardModule, NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';

import { environment } from '../../../../environments/environment';
import { COLUMN_ID_WIN_PROBABILITY, COLUMN_ID_DEAL_ID, COLUMN_ID_DEAL_AMOUNT, DATASET_ID } from '../../../constants/luzmo-constants';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { LanguageService } from '../../../services/language/language.service';
import { LuzmoApiService } from '../../../services/luzmo-api/luzmo-api.service';
import { ModalService } from '../../../services/modal/modal.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { LuzmoFlexChart, LuzmoEmbedCredentials } from '../../../types';

@Component({
  selector: 'app-deal-scorecard',
  imports: [CommonModule, NgxLuzmoDashboardModule, NgxLuzmoVizItemComponent, RouterModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [
    `
    .bar-container {
      height: 0.5rem;
      width: 100%;
      background: var(--color-surface-raised);
      border-radius: var(--border-radius-small);
      overflow: visible;
    }

    .bar {
      height: 100%;
      background: var(--color-primary);
      border-radius: var(--border-radius-small);
    }

    .timeline-container {
      height: 124px;
    }

    .progress-timeline {
      position: relative;
      background: var(--color-border);
      border-radius: var(--border-radius-small);
      margin: 1rem 0;
      overflow: visible;
    }

    .progress-bar {
      height: 0.25rem;
      background: var(--color-primary);
      border-radius: var(--border-radius-small) 0 0 var(--border-radius-small);
      position: relative;
    }

    .today-circle {
      position: absolute;
      top: 0.125rem;
      width: 1rem;
      height: 1rem;
      background: var(--color-text-dimmed);
      border-radius: 50%;
      transform: translateY(-50%);
    }

    .date-marker {
      position: absolute;
      bottom: -3rem;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: var(--color-text-dimmed);
      text-align: center;
      white-space: nowrap;
    }

    .date-label {
      display: block;
      margin-bottom: 0.25rem;
    }

    .date-marker.start {
      left: 0;
      text-align: left;
      transform: none;
    }

    .date-marker.today {
      color: var(--color-primary);
      transform: translateX(-66.666%);
    }

    .date-marker.end {
      left: 100%;
      text-align: right;
      transform: translateX(-100%);
    }

    .date-marker .date-label {
      font-weight: 500;
      font-size: 0.8125rem;
      color: var(--color-text);
    }
    `
  ],
  templateUrl: './deal-scorecard.component.html'
})
export class DealScorecardComponent implements OnInit {
  public luzmoApiService = inject(LuzmoApiService);
  public languageService = inject(LanguageService);
  public themeService = inject(ThemeService);
  private modalService = inject(ModalService);

  environment = environment;
  luzmoClose = luzmoClose;

  dealProbabilityChart?: LuzmoFlexChart;
  dealAmountChart?: LuzmoFlexChart;
  clickedDealData = {
    id: '',
    createdDate: '',
    expectedCloseDate: '',
    today: '',
    companyName: '',
    companySegment: '',
    dealStage: '',
    dealStageNumber: 0,
    industry: '',
    region: '',
    product: '',
    salesRep: '',
    manager: '',
    competitor: ''
  };
  luzmoEmbedCredentials: LuzmoEmbedCredentials = { token: '', key: '' };
  stageProgressPercentage = 0;

  ngOnInit(): void {
    const itemsBackground = getComputedStyle(document.body).getPropertyValue('--color-surface').trim();

    // Calculate the progress percentage based on the deal stage (max 5 stages)
    this.stageProgressPercentage = (this.clickedDealData.dealStageNumber / 5) * 100;

    this.dealProbabilityChart = {
      type: 'circular-gauge',
      options: {
        mode: 'normal',
        display: {
          title: false,
          gaugeValue: true,
          gaugeLabel: true
        },
        manualValues: {
          target: 1
        },
        circle: {
          width: 8,
          degrees: 360,
          background: 'rgba(0,0,0,.1)',
          lineCap: 'round',
          flip: false
        },
        noLinkCheck: true,
        interactivity: {
          availableExportTypes: [],
          customEvents: undefined,
          exportTypes: []
        },
        title: {
          en: 'Circular gauge',
          fr: 'Jauge circulaire',
          de: 'Kreisdiagramm',
          es: 'Indicador circular',
          nl: 'Cirkeldiagram'
        },
        ...this.luzmoApiService.getLuzmoFlexOptions(),
        theme: this.themeService.getLuzmoDashboardThemeNoBorders(itemsBackground)
      },
      slots: [
        {
          name: 'target',
          content: []
        },
        {
          name: 'measure',
          content: [
            {
              columnId: COLUMN_ID_WIN_PROBABILITY,
              datasetId: DATASET_ID,
              label: {
                en: 'Win probability',
                fr: 'Probabilité de succès',
                de: 'Gewinnwahrscheinlichkeit',
                es: 'Probabilidad de éxito',
                nl: 'Winkans'
              },
              type: 'numeric',
              subtype: null,
              format: ',.0a%',
              aggregationFunc: 'sum'
            }
          ]
        }
      ]
    };
    this.dealAmountChart = {
      type: 'evolution-number',
      options: {
        showTitle: false,
        showSubtitle: false,
        subtitle: {},
        showImage: false,
        imageMode: 'icon',
        imageSize: 40,
        imageAsBackground: false,
        imageRounded: false,
        imageColor: '#5A5A5A',
        imageBackgroundOpacity: 50,
        titlePosition: 'bottom',
        subtitlePosition: 'bottom',
        imagePosition: 'left',
        horizontalAlignment: 'center',
        verticalAlignment: 'middle',
        evolutionGraphDisplay: 'background',
        evolutionGraphType: 'area',
        evolutionGraphOpacity: 35,
        evolutionGraphInterpolation: 'linear',
        evolutionColor: 'normal',
        link: {
          tooltip: {}
        },
        interactivity: {
          availableExportTypes: [],
          customEvents: undefined,
          exportTypes: []
        },
        display: {
          title: false
        },
        missingValue: {
          type: 'no'
        },
        title: {
          en: 'Deal amount',
          fr: 'Montant du deal',
          de: 'Geschäftswert',
          es: 'Valor del negocio',
          nl: 'Dealwaarde'
        },
        ...this.luzmoApiService.getLuzmoFlexOptions(),
        theme: this.themeService.getLuzmoDashboardThemeNoBorders(itemsBackground)
      },
      slots: [
        {
          name: 'measure',
          content: [
            {
              columnId: COLUMN_ID_DEAL_AMOUNT,
              datasetId: DATASET_ID,
              label: {
                en: 'Deal amount',
                fr: 'Montant du deal',
                de: 'Geschäftswert',
                es: 'Valor del negocio',
                nl: 'Dealwaarde'
              },
              type: 'numeric',
              subtype: 'currency',
              format: '.3as',
              currency: this.languageService.getCurrencySymbol()
            }
          ]
        },
        {
          name: 'evolution',
          content: []
        }
      ]
    };

    this.dealProbabilityChart.filters = this.getScorecardFilters();
    this.dealAmountChart.filters = this.getScorecardFilters();
  }

  getScorecardFilters(): ItemFilterGroup[] {
    return [
      {
        condition: 'and',
        filters: [
          {
            expression: '? in ?',
            parameters: [
              {
                column_id: COLUMN_ID_DEAL_ID,
                dataset_id: DATASET_ID
              },
              [this.clickedDealData.id]
            ]
          }
        ]
      }
    ];
  }

  formatDate(date: string): string {
    const dateObj = new Date(date);

    return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
  }

  calculateTimelineProgress(): number {
    const createdDateStr = this.clickedDealData.createdDate;
    const expectedCloseDateStr = this.clickedDealData.expectedCloseDate;
    const todayDateStr = this.clickedDealData.today;

    if (!createdDateStr || !expectedCloseDateStr || !todayDateStr) {
      return 0;
    }

    const createdDate = new Date(createdDateStr);
    const expectedCloseDate = new Date(expectedCloseDateStr);
    const today = new Date(todayDateStr);

    // Calculate total time span and elapsed time
    const totalTimespan = expectedCloseDate.getTime() - createdDate.getTime();
    const elapsedTime = today.getTime() - createdDate.getTime();

    // Calculate progress percentage
    let progress = (elapsedTime / totalTimespan) * 100;

    // Ensure progress is between 0 and 100
    progress = Math.max(0, Math.min(100, progress));

    return progress;
  }

  closeModal() {
    this.modalService.closeAll();
  }
}
