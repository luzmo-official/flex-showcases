import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

export const WindowToken = new InjectionToken<Window>('Window', {
  factory: () => {
    const { defaultView } = inject(DOCUMENT);

    if (!defaultView) {
      throw new Error('Window is not available');
    }

    return defaultView;
  }
});

export function windowProvider() {
  const { defaultView } = inject(DOCUMENT);

  return defaultView;
}
