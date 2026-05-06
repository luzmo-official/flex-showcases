import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { LanguageService } from '../services/language/language.service';
import { TranslatePipe } from './translate.pipe';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  const translateSpy = vi.fn().mockReturnValue('translated-value');

  beforeEach(() => {
    translateSpy.mockClear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: LanguageService, useValue: { translate: translateSpy } }]
    });
    pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
  });

  it('delegates translation to LanguageService', () => {
    const params = { name: 'Ava' };

    const result = pipe.transform('overview.header-title', params);

    expect(result).toBe('translated-value');
    expect(translateSpy).toHaveBeenCalledWith('overview.header-title', params);
  });
});
