import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageService } from '../language/language.service';
import { LuzmoApiService } from '../luzmo-api/luzmo-api.service';
import { ThemeService } from '../theme/theme.service';
import { AuthService, availableUsers } from './auth.service';

class RouterStub {
  navigate = vi.fn().mockResolvedValue(true);
}

class ThemeServiceStub {
  setAppTheme = vi.fn();
}

class LanguageServiceStub {
  setLanguage = vi.fn();
}

class LuzmoApiServiceStub {
  clearLuzmoCredentials = vi.fn();
}

describe('AuthService', () => {
  let service: AuthService;
  let router: RouterStub;
  let themeService: ThemeServiceStub;
  let languageService: LanguageServiceStub;
  let luzmoApiService: LuzmoApiServiceStub;

  beforeEach(() => {
    router = new RouterStub();
    themeService = new ThemeServiceStub();
    languageService = new LanguageServiceStub();
    luzmoApiService = new LuzmoApiServiceStub();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: Router, useValue: router },
        { provide: ThemeService, useValue: themeService },
        { provide: LanguageService, useValue: languageService },
        { provide: LuzmoApiService, useValue: luzmoApiService }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('logs in a user and propagates theme and language preferences', () => {
    const user = availableUsers[0];
    const emissions: (typeof user | null)[] = [];
    const subscription = service.currentUser$.subscribe((value) => emissions.push(value));

    service.login(user);

    expect(service.currentUserValue).toEqual(user);
    expect(emissions).toEqual([null, user]);
    expect(themeService.setAppTheme).toHaveBeenCalledWith(user.appTheme);
    expect(languageService.setLanguage).toHaveBeenCalledWith(user.language);
    expect(router.navigate).toHaveBeenCalledWith(['/overview']);
    expect(service.isLoggedIn()).toBe(true);
    subscription.unsubscribe();
  });

  it('logs out the current user and resets defaults', () => {
    const user = availableUsers[1];
    const emissions: (typeof user | null)[] = [];
    const subscription = service.currentUser$.subscribe((value) => emissions.push(value));

    service.login(user);

    service.logout();

    expect(luzmoApiService.clearLuzmoCredentials).toHaveBeenCalled();
    expect(themeService.setAppTheme).toHaveBeenCalledWith('dark');
    expect(languageService.setLanguage).toHaveBeenCalledWith('en');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(service.currentUserValue).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(emissions).toEqual([null, user, null]);
    subscription.unsubscribe();
  });

  it('getCurrentUser mirrors the latest BehaviorSubject value', () => {
    expect(service.getCurrentUser()).toBeNull();

    const user = availableUsers[2];

    service.login(user);

    expect(service.getCurrentUser()).toEqual(user);
  });
});
