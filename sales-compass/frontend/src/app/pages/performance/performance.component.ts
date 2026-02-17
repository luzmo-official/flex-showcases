import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { luzmoDownload, luzmoEdit, luzmoPlus, luzmoTrash } from '@luzmo/icons';
import '@luzmo/analytics-components-kit/grid';
import '@luzmo/lucero/picker';
import '@luzmo/lucero/button';
import '@luzmo/lucero/tabs';
import '@luzmo/lucero/icon';
import { CustomEvent, NgxLuzmoDashboardComponent } from '@luzmo/ngx-embed';

import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language/language.service';
import { LuzmoApiService } from '../../services/luzmo-api/luzmo-api.service';
import { ModalService } from '../../services/modal/modal.service';
import { ThemeService } from '../../services/theme/theme.service';
import { DashboardConfig, LuzmoEmbedCredentials } from '../../types';
import { availablePredefinedDashboards, getLuzmoLoaderStyles } from '../report-builder/ede-dashboard-editor/ede-dashboard-editor-helper';

interface DashboardConfigItem {
  id: string;
  label: string;
  translationKey?: string; // For predefined dashboards - used for reactive translations
  dashboardId?: string; // Only for predefined dashboards
  edeDashboardId?: string; // Only for predefined dashboards. Copy of original dashboard.
  type: 'predefined' | 'custom';
  customDashboard?: DashboardConfig; // Only for custom dashboards
}

@Component({
  selector: 'app-performance',
  imports: [CommonModule, NgxLuzmoDashboardComponent, RouterModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [
    `
      .luzmo-dashboard-component {
        width: calc(100% + 2rem); /* Account for padding inside component */
      }
    `
  ],
  templateUrl: './performance.component.html'
})
export class PerformanceComponent {
  public luzmoApiService = inject(LuzmoApiService);
  public languageService = inject(LanguageService);
  public themeService = inject(ThemeService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  environment = environment;
  getLuzmoLoaderStyles = getLuzmoLoaderStyles;
  availablePredefinedDashboards = availablePredefinedDashboards;
  globalDashboardEditMode = this.luzmoApiService.globalDashboardEditMode;

  readonly luzmoDashboard = viewChild<NgxLuzmoDashboardComponent>('luzmoDashboard');

  luzmoDownload = luzmoDownload;
  luzmoPlus = luzmoPlus;
  luzmoTrash = luzmoTrash;
  luzmoEdit = luzmoEdit;

  readonly currentLanguage = signal(this.languageService.getCurrentLanguage());
  readonly luzmoEmbedCredentials = signal<LuzmoEmbedCredentials>({ token: '', key: '' });
  luzmoDashboardTheme = this.themeService.getLuzmoDashboardTheme();

  availableDashboards: DashboardConfigItem[] = availablePredefinedDashboards.map((dashboard) => ({
    id: dashboard.id,
    label: dashboard.translationKey, // Fallback for display, but template uses translationKey with translate pipe
    translationKey: dashboard.translationKey,
    dashboardId: dashboard.dashboardId,
    edeDashboardId: dashboard.edeDashboardId,
    type: 'predefined'
  }));
  activeDashboard: WritableSignal<DashboardConfigItem> = signal(this.availableDashboards[0]);

  readonly isExporting = signal(false);

  constructor() {
    this.luzmoApiService
      .getLuzmoCredentials()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((credentials) => {
        this.luzmoEmbedCredentials.set(credentials);
      });

    if (this.luzmoApiService.globalDashboardEditMode === 'modular-report-builder') {
      // Load custom dashboards from localStorage and add them to the list of dashboards
      (JSON.parse(localStorage.getItem('saved-dashboards') || '[]') || []).forEach((dashboard: DashboardConfig) => {
        this.availableDashboards.push({
          id: dashboard.id ?? '',
          label: dashboard.name,
          type: 'custom',
          customDashboard: dashboard
        });
      });
    }

    this.languageService.currentLanguage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((language) => {
      this.currentLanguage.set(language);
    });

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      dashboardId?: string;
      dashboardName?: string;
    };

    if (state?.dashboardId) {
      const dashboard = this.availableDashboards.find((d) => d.id === state.dashboardId) ?? this.availableDashboards[0];

      this.setActiveDashboard(dashboard);
    } else {
      this.setActiveDashboard(this.availableDashboards[0]);
    }
  }

  setActiveDashboard(dashboard: DashboardConfigItem) {
    this.activeDashboard.set(dashboard);

    if (dashboard.type === 'custom') {
      // Override loader styles
      this.activeDashboard().customDashboard?.items.forEach((item) => {
        item.options = {
          ...item.options,
          ...this.luzmoApiService.getLuzmoFlexOptions()
        };
      });
    }
  }

  onTabChange(event: any) {
    const selectedDashboardId = event.target.selected;
    const dashboard = this.availableDashboards.find((d) => d.id === selectedDashboardId);

    if (dashboard) {
      this.setActiveDashboard(dashboard);
    }
  }

  navigateToReportBuilder() {
    this.router.navigate(['/report-builder']);
  }

  async onCustomEvent(event: CustomEvent): Promise<void> {
    // "scorecard" custom event triggered from regular table in dashboard
    if (event.data.data.event === 'scorecard') {
      const data = event.data.data as any;
      const processedData: { name: string; value: any }[] = [];

      // Use only extraData: contains all columns of the dataset.
      if (data.extraData && typeof data.extraData === 'object') {
        Object.entries(data.extraData).forEach(([key, valueObj]: [string, any]) => {
          processedData.push({
            name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
            value: valueObj.value
          });
        });
      }

      const stages = {
        Prospecting: 1,
        Qualification: 2,
        Negotiation: 3,
        Proposal: 4,
        'Closed Won': 5,
        'Closed Lost': 5
      };

      const clickedDealData = {
        id: processedData.find((item) => item.name === 'Deal id')?.value,
        createdDate: new Date(processedData.find((item) => item.name === 'Created date')?.value).toISOString(),
        expectedCloseDate: new Date(processedData.find((item) => item.name === 'Expected close date')?.value).toISOString(),
        today: new Date().toISOString(),
        companyName: processedData.find((item) => item.name === 'Company name')?.value,
        companySegment: processedData.find((item) => item.name === 'Company segment')?.value,
        dealStage: processedData.find((item) => item.name === 'Deal stage')?.value,
        dealStageNumber: stages[processedData.find((item) => item.name === 'Deal stage')?.value as keyof typeof stages],
        industry: processedData.find((item) => item.name === 'Company industry')?.value,
        region: processedData.find((item) => item.name === 'Subregion')?.value,
        product: processedData.find((item) => item.name === 'Product name')?.value,
        salesRep: processedData.find((item) => item.name === 'Sales rep name')?.value,
        manager: processedData.find((item) => item.name === 'Sales manager name')?.value,
        competitor: processedData.find((item) => item.name === 'Primary competitor')?.value
      };

      const { DealScorecardComponent } = await import('./components/deal-scorecard.component');

      const modalRef = this.modalService.open(DealScorecardComponent, {
        centered: false,
        size: 'lg'
      });
      const componentInstance = modalRef.componentInstance;

      componentInstance.clickedDealData = clickedDealData;
      componentInstance.luzmoEmbedCredentials = this.luzmoEmbedCredentials();
    }
  }

  downloadDashboardAsPDF() {
    const dashboard = this.luzmoDashboard();

    if (dashboard) {
      this.isExporting.set(true);
      dashboard.exportDashboard('pdf').subscribe({
        error: (err) => {
          console.error('Export failed', err);
          this.isExporting.set(false);
        },
        complete: () => {
          this.isExporting.set(false);
        }
      });
    }
  }

  editDashboardInModularReportBuilder(dashboard: DashboardConfigItem) {
    if (dashboard.type === 'custom') {
      this.router.navigate(['/report-builder'], {
        state: {
          dashboardId: dashboard.id,
          predefined: false
        }
      });
    }
  }

  editDashboardInFullEDE(dashboard: DashboardConfigItem) {
    if (dashboard.type === 'predefined') {
      this.router.navigate(['/report-builder'], {
        state: {
          dashboardId: dashboard.dashboardId,
          predefined: true
        }
      });
    }
  }

  deleteDashboard(dashboard: DashboardConfigItem) {
    if (dashboard.type === 'custom') {
      // Remove from local availableDashboards array
      this.availableDashboards = this.availableDashboards.filter((d) => d.id !== dashboard.id);
      this.activeDashboard.set(this.availableDashboards[0]);

      // Remove from localStorage: filter out the dashboard with the matching name and save the updated array back to localStorage.
      const savedDashboards: DashboardConfig[] = JSON.parse(localStorage.getItem('saved-dashboards') || '[]');
      const updatedDashboards = savedDashboards.filter((savedDashboard) => savedDashboard.id !== dashboard.id);

      localStorage.setItem('saved-dashboards', JSON.stringify(updatedDashboards));

      // Set active dashboard to the first available dashboard
      this.setActiveDashboard(this.availableDashboards[0]);
    }
  }
}
