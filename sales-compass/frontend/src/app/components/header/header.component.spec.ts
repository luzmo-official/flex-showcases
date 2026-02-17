import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Luzmo packages to avoid ESM resolution issues
vi.mock('@luzmo/ngx-embed', () => ({
  NgxLuzmoVizItemComponent: {}
}));

vi.mock('@luzmo/lucero/search', () => ({}));
vi.mock('@luzmo/lucero/action-button', () => ({}));
vi.mock('@luzmo/lucero/picker', () => ({}));
vi.mock('@luzmo/lucero/menu', () => ({}));
vi.mock('@luzmo/lucero/field-label', () => ({}));

import { AuthService } from '../../services/auth/auth.service';
import { LanguageService } from '../../services/language/language.service';
import { LuzmoApiService } from '../../services/luzmo-api/luzmo-api.service';
import { ThemeService } from '../../services/theme/theme.service';
import { HeaderComponent } from './header.component';

class AuthServiceStub {
  logout = vi.fn();
  currentUser$ = of(null);
  getCurrentUser = vi.fn().mockReturnValue({ appTheme: 'dark' });
}

class LanguageServiceStub {
  currentLanguage$ = of('en');

  translate(key: string): string {
    return key;
  }

  setLanguage = vi.fn();
}

class LuzmoApiServiceStub {
  getLuzmoCredentials = vi.fn().mockReturnValue(of({ key: 'test-key', token: 'test-token' }));
  getStreamedIQAnswer = vi.fn().mockReturnValue(of());
  cancelActiveIQAnswer = vi.fn();
  getLuzmoFlexOptions = vi.fn().mockReturnValue({});
}

class ThemeServiceStub {
  isDarkMode = signal(false);
  themePresets: Array<{
    id: string;
    translationKey: string;
    colors: {
      surface: string;
      primary: string;
      secondary: string;
      borderHard: string;
    };
  }> = [];
  activePresetId = signal<string | null>(null);
  isCustomThemeActive = signal(false);
  applyPreset = vi.fn();
  resetToDefaultColors = vi.fn();
  setAppTheme = vi.fn();
}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let authService: AuthServiceStub;
  let languageService: LanguageServiceStub;
  let luzmoApiService: LuzmoApiServiceStub;
  let themeService: ThemeServiceStub;

  beforeEach(async () => {
    authService = new AuthServiceStub();
    languageService = new LanguageServiceStub();
    luzmoApiService = new LuzmoApiServiceStub();
    themeService = new ThemeServiceStub();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: LanguageService, useValue: languageService },
        { provide: LuzmoApiService, useValue: luzmoApiService },
        { provide: ThemeService, useValue: themeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('headerTitle', 'Test Header');
    fixture.detectChanges();
  });

  it('toggles the mobile menu when the navigation button is clicked', () => {
    const toggleButton = fixture.debugElement.query(By.css('luzmo-action-button[aria-label="Toggle navigation menu"]'));

    toggleButton.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(component.mobileMenuOpen()).toBe(true);
    expect(fixture.debugElement.query(By.css('.absolute.right-0'))).toBeTruthy();

    toggleButton.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(component.mobileMenuOpen()).toBe(false);
    expect(fixture.debugElement.query(By.css('.absolute.right-0'))).toBeFalsy();
  });

  it('closes the menu and logs out when logout is invoked', () => {
    component.mobileMenuOpen.set(true);

    component.logout();

    expect(component.mobileMenuOpen()).toBe(false);
    expect(authService.logout).toHaveBeenCalled();
  });

  it('resets to default colors and reapplies app theme when default preset is selected', () => {
    authService.getCurrentUser.mockReturnValue({ appTheme: 'light' });

    component.onPresetChange({ target: { value: 'default' } } as unknown as Event);

    expect(themeService.resetToDefaultColors).toHaveBeenCalled();
    expect(themeService.setAppTheme).toHaveBeenCalledWith('light');
    expect(themeService.applyPreset).not.toHaveBeenCalled();
  });

  it('applies a non-default preset selection', () => {
    component.onPresetChange({ target: { value: 'ocean' } } as unknown as Event);

    expect(themeService.applyPreset).toHaveBeenCalledWith('ocean');
    expect(themeService.resetToDefaultColors).not.toHaveBeenCalled();
  });

  it('changes language via picker event', () => {
    component.onLanguageChange({ target: { value: 'fr' } } as unknown as Event);

    expect(languageService.setLanguage).toHaveBeenCalledWith('fr');
  });

  it('resets to default theme and respects missing user data', () => {
    authService.getCurrentUser.mockReturnValue(null);

    component.resetToDefaultTheme();

    expect(themeService.resetToDefaultColors).toHaveBeenCalled();
    expect(themeService.setAppTheme).not.toHaveBeenCalled();
  });

  it('updates the search state and cancels active IQ requests on input', () => {
    const unsubscribeSpy = vi.fn();
    (component as any).activeQuestionSubscription = { unsubscribe: unsubscribeSpy };
    component.aiAnswer.set('Existing answer');
    component.aiError.set('Existing error');
    component.aiState.set('Custom state');
    component.isOverlayOpen.set(true);
    component.isStreaming.set(true);

    component.onSearchInput({ target: { value: 'new query' } } as unknown as Event);

    expect(component.searchQuery()).toBe('new query');
    expect(component.aiAnswer()).toBe('');
    expect(component.aiError()).toBeNull();
    expect(component.aiState()).toBe('overview.ai-state-gathering-metrics');
    expect(component.isOverlayOpen()).toBe(false);
    expect(component.isStreaming()).toBe(false);
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(luzmoApiService.cancelActiveIQAnswer).toHaveBeenCalled();
    expect((component as any).activeQuestionSubscription).toBeNull();
  });

  it('reopens the overlay when searching is focused with existing results', () => {
    component.aiAnswer.set('Answer');
    component.isOverlayOpen.set(false);

    component.onSearchFocus();

    expect(component.isSearchFocused()).toBe(true);
    expect(component.isOverlayOpen()).toBe(true);

    component.onSearchBlur();

    expect(component.isSearchFocused()).toBe(false);
  });

  it('closes the overlay when submitting an empty query', () => {
    const submitEvent = new Event('submit');
    const preventDefault = vi.spyOn(submitEvent, 'preventDefault');
    const stopPropagation = vi.spyOn(submitEvent, 'stopPropagation');
    const closeOverlaySpy = vi.spyOn(component, 'closeOverlay');

    component.searchQuery.set('   ');
    component.onSearchSubmit(submitEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(closeOverlaySpy).toHaveBeenCalled();
    expect(luzmoApiService.getStreamedIQAnswer).not.toHaveBeenCalled();
  });

  it('shows an error when submitting without credentials', () => {
    const submitEvent = new Event('submit');
    vi.spyOn(submitEvent, 'preventDefault');
    vi.spyOn(submitEvent, 'stopPropagation');
    (component as any).luzmoCredentials.set({ key: '', token: '' });
    component.searchQuery.set('Revenue performance');

    component.onSearchSubmit(submitEvent);

    expect(component.aiError()).toBe('overview.ai-summary-error');
    expect(component.aiAnswer()).toBe('');
    expect(component.isOverlayOpen()).toBe(true);
    expect(component.isStreaming()).toBe(false);
    expect(component.aiState()).toBe('overview.ai-state-gathering-metrics');
    expect(luzmoApiService.getStreamedIQAnswer).not.toHaveBeenCalled();
  });

  it('streams IQ answers and charts, updating state as events arrive', () => {
    const submitEvent = new Event('submit');
    vi.spyOn(submitEvent, 'preventDefault');
    vi.spyOn(submitEvent, 'stopPropagation');
    const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => 'rgb(1, 2, 3)'
    } as unknown as CSSStyleDeclaration);
    const responses$ = new Subject<
      | { type: 'state'; state: string }
      | { type: 'chunk'; text: string }
      | { type: 'chart'; chart: { type: string; slots: any[]; options: Record<string, any> } }
    >();

    luzmoApiService.getStreamedIQAnswer.mockReturnValue(responses$.asObservable());
    luzmoApiService.getLuzmoFlexOptions.mockReturnValue({ theme: 'demo' });
    component.searchQuery.set('Revenue performance');

    component.onSearchSubmit(submitEvent);

    expect(component.isStreaming()).toBe(true);
    expect(component.isOverlayOpen()).toBe(true);
    expect(component.aiError()).toBeNull();
    expect(luzmoApiService.getStreamedIQAnswer).toHaveBeenCalledWith('Revenue performance', 'test-key', 'test-token');

    responses$.next({ type: 'state', state: 'gatheringMetrics' });
    expect(component.aiState()).toBe('Gathering Metrics');

    responses$.next({ type: 'chunk', text: 'The pipeline is healthy.' });
    expect(component.aiAnswer()).toBe('The pipeline is healthy.');

    responses$.next({
      type: 'chart',
      chart: { type: 'bar', slots: [], options: { color: 'blue' } }
    });
    expect(component.aiChart()?.type).toBe('bar');
    expect(component.aiChart()?.options).toMatchObject({ color: 'blue', theme: 'demo' });

    responses$.complete();
    expect(component.isStreaming()).toBe(false);
    getComputedStyleSpy.mockRestore();
  });

  it('handles stream errors and stops streaming', () => {
    const submitEvent = new Event('submit');
    vi.spyOn(submitEvent, 'preventDefault');
    vi.spyOn(submitEvent, 'stopPropagation');
    luzmoApiService.getStreamedIQAnswer.mockReturnValue(throwError(() => new Error('Network down')));
    component.searchQuery.set('Revenue performance');

    component.onSearchSubmit(submitEvent);

    expect(component.isStreaming()).toBe(false);
    expect(component.aiError()).toBe('Network down');
  });

  it('closes the overlay and cancels streaming when requested', () => {
    const unsubscribeSpy = vi.fn();
    (component as any).activeQuestionSubscription = { unsubscribe: unsubscribeSpy };
    component.isOverlayOpen.set(true);
    component.isStreaming.set(true);

    component.closeOverlay();

    expect(component.isOverlayOpen()).toBe(false);
    expect(component.isStreaming()).toBe(false);
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(luzmoApiService.cancelActiveIQAnswer).toHaveBeenCalled();
    expect((component as any).activeQuestionSubscription).toBeNull();
  });

  it('closes menus and overlays when clicking outside the component', () => {
    const unsubscribeSpy = vi.fn();
    (component as any).activeQuestionSubscription = { unsubscribe: unsubscribeSpy };
    component.mobileMenuOpen.set(true);
    component.isOverlayOpen.set(true);
    const outsideEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(outsideEvent, 'target', {
      value: document.createElement('div')
    });

    component.onDocumentClick(outsideEvent);

    expect(component.mobileMenuOpen()).toBe(false);
    expect(component.isOverlayOpen()).toBe(false);
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(luzmoApiService.cancelActiveIQAnswer).toHaveBeenCalled();
  });

  it('keeps menus open when clicking inside the component', () => {
    const insideTarget = fixture.nativeElement.querySelector('header') ?? fixture.nativeElement;
    component.mobileMenuOpen.set(true);
    component.isOverlayOpen.set(true);
    const insideEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(insideEvent, 'target', {
      value: insideTarget
    });

    component.onDocumentClick(insideEvent);

    expect(component.mobileMenuOpen()).toBe(true);
    expect(component.isOverlayOpen()).toBe(true);
  });

  it('closes menus on escape key', () => {
    component.mobileMenuOpen.set(true);
    component.isOverlayOpen.set(true);

    component.onEscapeKey();

    expect(component.mobileMenuOpen()).toBe(false);
    expect(component.isOverlayOpen()).toBe(false);
  });

  it('unsubscribes from credentials and active IQ requests on destroy', () => {
    const credentialsUnsubscribe = vi.fn();
    const activeUnsubscribe = vi.fn();
    (component as any).credentialsSubscription = { unsubscribe: credentialsUnsubscribe };
    (component as any).activeQuestionSubscription = { unsubscribe: activeUnsubscribe };

    component.ngOnDestroy();

    expect(credentialsUnsubscribe).toHaveBeenCalled();
    expect(activeUnsubscribe).toHaveBeenCalled();
    expect(luzmoApiService.cancelActiveIQAnswer).toHaveBeenCalled();
  });

  it('derives the selected preset and default theme colors from services', () => {
    themeService.themePresets = [
      {
        id: 'ocean',
        translationKey: 'theme.ocean',
        colors: {
          surface: '#111',
          primary: '#222',
          secondary: '#333',
          borderHard: '#444'
        }
      }
    ];
    themeService.activePresetId.set('ocean');
    authService.getCurrentUser.mockReturnValue({ appTheme: 'dark' });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.selectedPreset()?.id).toBe('ocean');
    expect(component.defaultThemeColors().surface).toBe('rgb(38, 38, 36)');

    authService.getCurrentUser.mockReturnValue({ appTheme: 'light' });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.defaultThemeColors().surface).toBe('rgb(246, 238, 227)');
  });
});
