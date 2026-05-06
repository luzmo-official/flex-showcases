import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgxLuzmoDashboardModule } from '@luzmo/ngx-embed';

import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../services/language/language.service';
import { LuzmoApiService } from '../../../services/luzmo-api/luzmo-api.service';
import { LuzmoEmbedCredentials } from '../../../types';
import { availablePredefinedDashboards, getLuzmoLoaderStyles } from './ede-dashboard-editor-helper';

@Component({
  selector: 'app-ede-dashboard-editor',
  imports: [CommonModule, NgxLuzmoDashboardModule],
  templateUrl: './ede-dashboard-editor.component.html',
  host: {
    class: 'block h-full'
  }
})
export class EdeDashboardEditorComponent {
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private luzmoApiService = inject(LuzmoApiService);
  private destroyRef = inject(DestroyRef);

  environment = environment;
  readonly luzmoEmbedCredentials = signal<LuzmoEmbedCredentials>({ token: '', key: '' });
  readonly currentLanguage = signal(this.languageService.getCurrentLanguage());
  predefinedDashboardId: string | null = null;

  getLuzmoLoaderStyles = getLuzmoLoaderStyles;

  constructor() {
    this.languageService.currentLanguage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((language) => {
      this.currentLanguage.set(language);
    });

    this.luzmoApiService
      .getLuzmoCredentials()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((credentials) => {
        this.luzmoEmbedCredentials.set(credentials);
      });

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      dashboardId?: string;
      predefined?: boolean;
    };

    const defaultDashboardId = availablePredefinedDashboards[0]?.edeDashboardId ?? null;

    this.predefinedDashboardId = state?.dashboardId && state.predefined ? state.dashboardId : defaultDashboardId;
  }
}
