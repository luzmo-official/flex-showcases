import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LuzmoApiService } from './services/luzmo-api/luzmo-api.service';
import { ThemeService } from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private themeService = inject(ThemeService);
  private luzmoApiService = inject(LuzmoApiService);
  title = 'Sales Compass';

  constructor() {
    // Apply dark theme first (as a base)
    document.body.classList.toggle('dark-theme', true);

    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);

    // Check if a custom theme is in URL. If so, apply it.
    if (urlObj.searchParams.has('theme')) {
      this.themeService.applyThemeFromUrl(currentUrl);
    }
    // Otherwise load saved theme from localStorage.
    else {
      this.themeService.loadSavedCustomTheme();
    }

    // Update browser theme color to match surface color
    this.themeService.updateBrowserThemeColor();

    // Check if "mode" is in URL params. Only valid value is "ede", which will replace the report builder with the EDE.
    const modeParam = urlObj.searchParams.get('mode');

    if (modeParam === 'ede') {
      this.luzmoApiService.setGlobalDashboardEditMode('full-ede');
    } else {
      this.luzmoApiService.setGlobalDashboardEditMode('modular-report-builder');
    }
  }
}
