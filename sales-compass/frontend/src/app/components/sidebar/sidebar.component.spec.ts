import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@luzmo/lucero/button', () => ({}));
vi.mock('@luzmo/lucero/action-button', () => ({}));
vi.mock('@luzmo/lucero/icon', () => ({}));
vi.mock('@luzmo/lucero/tabs', () => ({}));
vi.mock('@luzmo/lucero/picker', () => ({}));
vi.mock('@luzmo/lucero/menu', () => ({}));

import { AuthService } from '../../services/auth/auth.service';
import { LanguageService } from '../../services/language/language.service';
import { ModalService } from '../../services/modal/modal.service';
import { ThemeService } from '../../services/theme/theme.service';
import { SidebarComponent } from './sidebar.component';

const testRoutes = [
  { path: 'overview', component: SidebarComponent },
  { path: 'performance', component: SidebarComponent },
  { path: 'report-builder', component: SidebarComponent }
];

class AuthServiceStub {
  currentUser$ = new BehaviorSubject<any>(null);
  logout = vi.fn();
  getCurrentUser = vi.fn();
}

class LanguageServiceStub {
  currentLanguage$ = new BehaviorSubject<'en' | 'fr' | 'de' | 'es' | 'nl'>('en');
  setLanguage = vi.fn();

  translate(key: string): string {
    return key;
  }
}

class ThemeServiceStub {
  isDarkMode = signal(false);
  themePresets = [
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
  activePresetId = signal<string | null>(null);
  isCustomThemeActive = signal(false);
  applyPreset = vi.fn();
  resetToDefaultColors = vi.fn();
  setAppTheme = vi.fn();
}

class ModalServiceStub {
  open = vi.fn();
}

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let component: SidebarComponent;
  let router: Router;
  let authService: AuthServiceStub;
  let languageService: LanguageServiceStub;
  let themeService: ThemeServiceStub;
  let modalService: ModalServiceStub;

  beforeEach(async () => {
    authService = new AuthServiceStub();
    languageService = new LanguageServiceStub();
    themeService = new ThemeServiceStub();
    modalService = new ModalServiceStub();

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule.withRoutes(testRoutes)],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authService },
        { provide: LanguageService, useValue: languageService },
        { provide: ThemeService, useValue: themeService },
        { provide: ModalService, useValue: modalService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('initializes the current route from the router url', async () => {
    await router.navigateByUrl('/performance?foo=1');

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.currentRoute()).toBe('/performance');
  });

  it('updates the current route when navigation ends', async () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await router.navigateByUrl('/report-builder?x=1');
    fixture.detectChanges();

    expect(component.currentRoute()).toBe('/report-builder');
  });

  it('resets to default colors and reapplies app theme when default preset is selected', () => {
    authService.getCurrentUser.mockReturnValue({ appTheme: 'dark' });

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    component.onPresetChange({ target: { value: 'default' } } as unknown as Event);

    expect(themeService.resetToDefaultColors).toHaveBeenCalled();
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(themeService.setAppTheme).toHaveBeenCalledWith('dark');
    expect(themeService.applyPreset).not.toHaveBeenCalled();
  });

  it('applies a non-default preset selection', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    component.onPresetChange({ target: { value: 'ocean' } } as unknown as Event);

    expect(themeService.applyPreset).toHaveBeenCalledWith('ocean');
    expect(themeService.resetToDefaultColors).not.toHaveBeenCalled();
  });

  it('opens the color customization modal when the custom theme option is selected', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    const openSpy = vi.spyOn(component, 'openColorCustomizationModal').mockResolvedValue(undefined);

    component.onPresetChange({ target: { value: 'custom' } } as unknown as Event);

    expect(openSpy).toHaveBeenCalled();
    expect(themeService.applyPreset).not.toHaveBeenCalled();
    expect(themeService.resetToDefaultColors).not.toHaveBeenCalled();
  });

  it('resets to default theme and respects missing user data', () => {
    authService.getCurrentUser.mockReturnValue(null);

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    component.resetToDefaultTheme();

    expect(themeService.resetToDefaultColors).toHaveBeenCalled();
    expect(themeService.setAppTheme).not.toHaveBeenCalled();
  });

  it('changes language via picker event', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    component.onLanguageChange({ target: { value: 'fr' } } as unknown as Event);

    expect(languageService.setLanguage).toHaveBeenCalledWith('fr');
  });

  it('changes language directly via setLanguage', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    component.setLanguage('de');

    expect(languageService.setLanguage).toHaveBeenCalledWith('de');
  });

  it('logs out via the auth service', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('navigates when a tab selection is provided', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onTabChange({ target: { selected: '/overview' } });

    expect(navigateSpy).toHaveBeenCalledWith(['/overview']);
  });

  it('does not navigate when the tab selection is empty', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onTabChange({ target: { selected: '' } });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('selects the default theme when no preset or custom theme is active', () => {
    themeService.isCustomThemeActive.set(false);
    themeService.activePresetId.set(null);

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const picker = fixture.debugElement.query(By.css('luzmo-picker'))?.nativeElement as any;

    expect(picker?.value).toBe('default');
    expect(fixture.debugElement.query(By.css('luzmo-menu-item[value="custom"]'))).toBeTruthy();
  });

  it('selects the active preset when a preset theme is active', () => {
    themeService.isCustomThemeActive.set(false);
    themeService.activePresetId.set('ocean');

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const picker = fixture.debugElement.query(By.css('luzmo-picker'))?.nativeElement as any;

    expect(picker?.value).toBe('ocean');
  });

  it('selects the custom theme option when a custom theme is active', () => {
    themeService.isCustomThemeActive.set(true);
    themeService.activePresetId.set(null);

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const picker = fixture.debugElement.query(By.css('luzmo-picker'))?.nativeElement as any;

    expect(picker?.value).toBe('custom');
  });

  it('shows empty circles for the custom theme option when a custom theme is not active', () => {
    themeService.isCustomThemeActive.set(false);
    themeService.activePresetId.set('ocean');

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const circles = fixture.debugElement.queryAll(By.css('luzmo-menu-item[value="custom"] span.w-5'));

    expect(circles.length).toBe(3);
    expect((circles[0].nativeElement as HTMLElement).style.background).toBe('transparent');
    expect((circles[1].nativeElement as HTMLElement).style.background).toBe('transparent');
    expect((circles[2].nativeElement as HTMLElement).style.background).toBe('transparent');
  });

  it('shows the active custom theme colors in the circles when a custom theme is active', () => {
    themeService.isCustomThemeActive.set(true);
    themeService.activePresetId.set(null);

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const circles = fixture.debugElement.queryAll(By.css('luzmo-menu-item[value="custom"] span.w-5'));

    expect(circles.length).toBe(3);
    expect((circles[0].nativeElement as HTMLElement).style.background).toBe('var(--color-surface)');
    expect((circles[1].nativeElement as HTMLElement).style.background).toBe('var(--color-primary)');
    expect((circles[2].nativeElement as HTMLElement).style.background).toBe('var(--color-secondary)');
  });

  it('derives default theme colors from the user theme', () => {
    authService.currentUser$.next({ appTheme: 'dark' });

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    expect(component.defaultThemeColors().surface).toBe('rgb(38, 38, 36)');

    authService.currentUser$.next({ appTheme: 'light' });

    expect(component.defaultThemeColors().surface).toBe('rgb(246, 238, 227)');
  });
});
