import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Luzmo packages used by child components (HeaderComponent, SidebarComponent)
vi.mock('@luzmo/ngx-embed', () => ({
  NgxLuzmoVizItemComponent: {}
}));
vi.mock('@luzmo/lucero/button', () => ({}));
vi.mock('@luzmo/lucero/action-button', () => ({}));
vi.mock('@luzmo/lucero/icon', () => ({}));
vi.mock('@luzmo/lucero/tabs', () => ({}));
vi.mock('@luzmo/lucero/picker', () => ({}));
vi.mock('@luzmo/lucero/menu', () => ({}));
vi.mock('@luzmo/lucero/search', () => ({}));
vi.mock('@luzmo/lucero/field-label', () => ({}));

import { Language, LanguageService } from '../../services/language/language.service';
import { AuthenticatedLayoutComponent } from './authenticated-layout.component';

// Dummy component for test routes
@Component({ selector: 'app-dummy', template: '' })
class DummyComponent {}

// Service stub with BehaviorSubject for reactive language changes
class LanguageServiceStub {
  currentLanguage$ = new BehaviorSubject<Language>('en');

  translate = vi.fn((key: string) => `translated:${key}`);
}

// Test routes with various headerTitleKey configurations
const testRoutes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    children: [
      {
        path: 'overview',
        component: DummyComponent,
        data: { headerTitleKey: 'overview.header-title' }
      },
      {
        path: 'performance',
        component: DummyComponent,
        data: { headerTitleKey: 'performance.header-title' }
      },
      {
        path: 'no-title',
        component: DummyComponent
        // No headerTitleKey data
      },
      {
        path: 'invalid-title',
        component: DummyComponent,
        data: { headerTitleKey: 123 } // Non-string value
      }
    ]
  }
];

describe('AuthenticatedLayoutComponent', () => {
  let fixture: ComponentFixture<AuthenticatedLayoutComponent>;
  let component: AuthenticatedLayoutComponent;
  let router: Router;
  let languageService: LanguageServiceStub;

  beforeEach(async () => {
    languageService = new LanguageServiceStub();

    await TestBed.configureTestingModule({
      imports: [AuthenticatedLayoutComponent, RouterTestingModule.withRoutes(testRoutes)],
      providers: [provideZonelessChangeDetection(), { provide: LanguageService, useValue: languageService }]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  describe('Initial Route Title Resolution', () => {
    it('reads headerTitleKey from the initial active route on construction', async () => {
      await router.navigateByUrl('/overview');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(languageService.translate).toHaveBeenCalledWith('overview.header-title');
      expect(component.headerTitle()).toBe('translated:overview.header-title');
    });

    it('translates the title key using LanguageService', async () => {
      languageService.translate.mockReturnValue('Overview Dashboard');
      await router.navigateByUrl('/overview');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.headerTitle()).toBe('Overview Dashboard');
    });
  });

  describe('Navigation Event Handling', () => {
    it('updates header title when navigating to a different route', async () => {
      await router.navigateByUrl('/overview');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.headerTitle()).toBe('translated:overview.header-title');

      await router.navigateByUrl('/performance');
      fixture.detectChanges();

      expect(languageService.translate).toHaveBeenCalledWith('performance.header-title');
      expect(component.headerTitle()).toBe('translated:performance.header-title');
    });

    it('calls translate with the new route headerTitleKey after navigation', async () => {
      await router.navigateByUrl('/overview');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      languageService.translate.mockClear();

      await router.navigateByUrl('/performance');
      fixture.detectChanges();

      expect(languageService.translate).toHaveBeenCalledWith('performance.header-title');
    });
  });

  describe('Missing Header Title Key', () => {
    it('returns empty string when route has no headerTitleKey data', async () => {
      await router.navigateByUrl('/no-title');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.headerTitle()).toBe('');
    });

    it('handles non-string headerTitleKey values gracefully', async () => {
      await router.navigateByUrl('/invalid-title');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.headerTitle()).toBe('');
    });

    it('clears header title when navigating from titled to untitled route', async () => {
      await router.navigateByUrl('/overview');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.headerTitle()).toBe('translated:overview.header-title');

      await router.navigateByUrl('/no-title');
      fixture.detectChanges();

      expect(component.headerTitle()).toBe('');
    });
  });

  describe('Language Change Reactivity', () => {
    it('re-translates header title when currentLanguage$ emits a new value', async () => {
      await router.navigateByUrl('/overview');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.headerTitle()).toBe('translated:overview.header-title');

      // Change language and update translate mock to return different value
      languageService.translate.mockReturnValue('translated:overview.header-title:fr');
      languageService.currentLanguage$.next('fr');
      fixture.detectChanges();

      // The computed signal should have re-evaluated
      expect(component.headerTitle()).toBe('translated:overview.header-title:fr');
    });

    it('headerTitle computed signal reacts to language changes', async () => {
      await router.navigateByUrl('/performance');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const initialTitle = component.headerTitle();
      expect(initialTitle).toBe('translated:performance.header-title');

      // Simulate language change
      languageService.translate.mockReturnValue('Tableau de bord des performances');
      languageService.currentLanguage$.next('fr');
      fixture.detectChanges();

      const updatedTitle = component.headerTitle();
      expect(updatedTitle).toBe('Tableau de bord des performances');
      expect(updatedTitle).not.toBe(initialTitle);
    });
  });

  describe('Route Tree Traversal', () => {
    it('finds the deepest child route headerTitleKey', async () => {
      await router.navigateByUrl('/overview');

      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // The component should traverse to the child route and get its headerTitleKey
      expect(languageService.translate).toHaveBeenCalledWith('overview.header-title');
    });

    it('works correctly when navigating between multiple routes', async () => {
      fixture = TestBed.createComponent(AuthenticatedLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      await router.navigateByUrl('/overview');
      fixture.detectChanges();
      expect(component.headerTitle()).toBe('translated:overview.header-title');

      await router.navigateByUrl('/performance');
      fixture.detectChanges();
      expect(component.headerTitle()).toBe('translated:performance.header-title');

      await router.navigateByUrl('/no-title');
      fixture.detectChanges();
      expect(component.headerTitle()).toBe('');

      await router.navigateByUrl('/overview');
      fixture.detectChanges();
      expect(component.headerTitle()).toBe('translated:overview.header-title');
    });
  });
});
