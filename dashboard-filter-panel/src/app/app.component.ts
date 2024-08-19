import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LocationService } from './shared/services/location.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { STORAGE_PROVIDERS } from './shared/services/storage.service';
import { WindowToken, windowProvider } from './shared/services/window';

@Component({ selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, MatSidenavModule, MatIconModule],
  providers: [
    LocationService,
    STORAGE_PROVIDERS,
    { provide: WindowToken, useFactory: windowProvider },
  ],
})
export class AppComponent {
  title = 'Luzmo Angular Examples';
}
