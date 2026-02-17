import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Language, TRANSLATIONS } from './translations';

export { Language } from './translations';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    this.currentLanguageSubject.next('en');
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    if (TRANSLATIONS[language]) {
      if (language !== this.currentLanguageSubject.value) {
        this.currentLanguageSubject.next(language);
      }

      if (document.documentElement.lang !== language) {
        document.documentElement.lang = language;
      }
    }
  }

  translate(key: string, params?: Record<string, string>): string {
    const currentLang = this.currentLanguageSubject.value;
    const [component, translationKey] = key.split('.');

    if (!translationKey) {
      return key;
    }

    let translatedText = TRANSLATIONS[currentLang][component]?.[translationKey] || key;

    // Replace placeholders with actual values if params are provided
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        const placeholder = `{{${paramKey}}}`;

        translatedText = translatedText.replaceAll(new RegExp(placeholder, 'g'), params[paramKey]);
      });
    }

    return translatedText;
  }

  getCurrencySymbol(): '€' | '$' {
    return this.currentLanguageSubject.value === 'en' ? '$' : '€';
  }
}
