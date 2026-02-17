import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { Language, LanguageService } from '../language/language.service';
import { LuzmoApiService } from '../luzmo-api/luzmo-api.service';
import { AppTheme, ThemeService } from '../theme/theme.service';

export interface User {
  name: string;
  firstName: string;
  title: string;
  titleKey: string;
  initials: string;
  imageUrl?: string;
  appTheme: AppTheme;
  language: Language;
}

export const availableUsers: User[] = [
  {
    name: 'Marcus Williams',
    firstName: 'Marcus',
    title: 'Sales Director, North America',
    titleKey: 'user.title-sales-director-north-america',
    initials: 'MW',
    imageUrl: 'assets/headshots/marcus_williams.png',
    appTheme: 'dark',
    language: 'en'
  },
  {
    name: 'Sarah Chen',
    firstName: 'Sarah',
    title: 'Sales Director, Asia',
    titleKey: 'user.title-sales-director-asia',
    initials: 'SC',
    imageUrl: 'assets/headshots/sarah_chen.png',
    appTheme: 'dark',
    language: 'en'
  },
  {
    name: 'Alex Morgan',
    firstName: 'Alex',
    title: 'Sales Director, Europe',
    titleKey: 'user.title-sales-director-europe',
    initials: 'AM',
    imageUrl: 'assets/headshots/alex_morgan.png',
    appTheme: 'light',
    language: 'fr'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private router = inject(Router);
  private luzmoApiService = inject(LuzmoApiService);
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(user: User): void {
    this.currentUserSubject.next(user);
    this.themeService.setAppTheme(user.appTheme);
    this.languageService.setLanguage(user.language);
    this.router.navigate(['/overview']);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.luzmoApiService.clearLuzmoCredentials();
    this.themeService.setAppTheme('dark');
    this.languageService.setLanguage('en');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getCurrentUser(): User | null {
    return this.currentUserValue;
  }
}
