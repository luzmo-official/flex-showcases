
import { DOCUMENT, Location } from '@angular/common';
import { Inject, Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable()
export class LocationService {
      private readonly location = inject(Location);
      private readonly router = inject(Router);
      private readonly document = inject<Document>(DOCUMENT);
  private readonly urlParser = this.document.createElement('a');
  private urlSubject = new ReplaySubject<string>(1);
  private stripSlashes(url: string) {
    return url.replace(/^\/+/, '').replace(/\/+(\?|#|$)/, '$1');
  }

  currentUrl = this.urlSubject
    .pipe(map(url => this.stripSlashes(url)));

  currentPath = this.currentUrl.pipe(
    map(url => (url.match(/[^#?]*/) || [''])[0])  // strip query and hash
  );

  currentFragment = this.currentUrl.pipe(
    map(url => (((url || '').split('#')?.[1] || '').match(/[^#?]*/) || [''])[0]),  // get fragment
  );

  constructor(
) {
    this.urlSubject.next(this.location.path(true));

    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      map((event: any) => event.url)
    )
      .subscribe(url => this.urlSubject.next(url || ''));
  }
}
