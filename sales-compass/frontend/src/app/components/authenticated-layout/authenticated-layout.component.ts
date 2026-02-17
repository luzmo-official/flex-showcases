import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { LanguageService } from '../../services/language/language.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './authenticated-layout.component.html'
})
export class AuthenticatedLayoutComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);
  private destroyRef = inject(DestroyRef);
  private headerTitleKey = signal('');

  readonly currentLanguage = toSignal(this.languageService.currentLanguage$);
  readonly headerTitle = computed(() => {
    this.currentLanguage();

    const key = this.headerTitleKey();

    return key ? this.languageService.translate(key) : '';
  });

  constructor() {
    this.updateHeaderTitleKey();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateHeaderTitleKey();
      });
  }

  private updateHeaderTitleKey(): void {
    let activeRoute = this.route;

    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    const titleKey = activeRoute.snapshot?.data?.['headerTitleKey'];

    this.headerTitleKey.set(typeof titleKey === 'string' ? titleKey : '');
  }
}
