import { Pipe, PipeTransform, inject } from '@angular/core';

import { LanguageService } from '../services/language/language.service';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string, params?: Record<string, string>): string {
    return this.languageService.translate(key, params);
  }
}
