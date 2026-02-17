import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal, type Type } from '@angular/core';

import { ReportBuilderStateService } from './modular-report-builder-state.service';

@Component({
  selector: 'app-modular-report-builder',
  imports: [NgComponentOutlet, AsyncPipe],
  providers: [ReportBuilderStateService],
  templateUrl: './modular-report-builder.component.html',
  host: {
    class: 'block h-full'
  }
})
export class ModularReportBuilderComponent {
  private destroyRef = inject(DestroyRef);
  private mediaQueryList = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null;

  readonly isDesktop = signal(this.mediaQueryList ? this.mediaQueryList.matches : true);
  readonly activeBuilderComponent = computed<Promise<Type<unknown>>>(() =>
    this.isDesktop()
      ? import('./desktop-modular-report-builder/desktop-modular-report-builder.component').then(
          (component) => component.DesktopModularReportBuilderComponent
        )
      : import('./mobile-modular-report-builder/mobile-modular-report-builder.component').then(
          (component) => component.MobileModularReportBuilderComponent
        )
  );

  constructor() {
    if (this.mediaQueryList) {
      const handler = (event: MediaQueryListEvent) => {
        this.isDesktop.set(event.matches);
      };

      this.mediaQueryList.addEventListener('change', handler);
      this.destroyRef.onDestroy(() => {
        this.mediaQueryList?.removeEventListener('change', handler);
      });
    }
  }
}
