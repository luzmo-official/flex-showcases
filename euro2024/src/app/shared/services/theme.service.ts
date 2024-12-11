/* eslint-disable unicorn/no-array-for-each */
import { DOCUMENT } from '@angular/common';
import { Injectable, Renderer2, inject } from '@angular/core';
import { WindowToken } from './window';
import { ThemeMode } from '../models/common.model';
import { LocalStorage } from './storage.service';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly localStorage = inject(LocalStorage);
  private readonly window = inject(WindowToken);

  currentThemeMode: Subject<ThemeMode> = new BehaviorSubject<ThemeMode>('auto');
  darkOrLightMode: Subject<ThemeMode> = new BehaviorSubject<ThemeMode>('dark');
  private _darkOrLightMode!: ThemeMode;

  constructor() {}

  initializeTheme(renderer: Renderer2): void {
    // get from local storage
    const localTheme = this.localStorage?.getItem('theme') || 'auto';

    if (localTheme === 'auto' || localTheme === 'dark' || localTheme === 'light') {
      this.currentThemeMode.next(localTheme);

      if (localTheme && ['dark', 'light'].includes(localTheme)) {
        this._darkOrLightMode = localTheme;
      }
      else {
        this._darkOrLightMode = this.window?.matchMedia && this.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    }
    else {
      this.currentThemeMode.next('auto');
      this._darkOrLightMode = this.window?.matchMedia && this.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    this.darkOrLightMode.next(this._darkOrLightMode);

    renderer.setAttribute(this.document.documentElement, 'data-theme', this._darkOrLightMode);
  }

  switchTheme(renderer: Renderer2, theme: ThemeMode): ThemeMode {
    const prefersDarkTheme = this.window?.matchMedia && this.window.matchMedia('(prefers-color-scheme: dark)').matches;
    const _darkOrLightMode = theme === 'auto' ? (prefersDarkTheme ? 'dark' : 'light') : theme;

    this._darkOrLightMode = _darkOrLightMode;
    this.localStorage.setItem('theme', theme);
    this.currentThemeMode.next(theme);

    renderer.setAttribute(this.document.documentElement, 'data-theme', this._darkOrLightMode);

    this.darkOrLightMode.next(this._darkOrLightMode);

    return this._darkOrLightMode;
  }
}
