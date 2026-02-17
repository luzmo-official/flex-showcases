import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((component) => component.LoginComponent),
    title: 'SalesCompass - Login'
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/authenticated-layout/authenticated-layout.component').then(
        (component) => component.AuthenticatedLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview.component').then((component) => component.OverviewComponent),
        title: 'SalesCompass - Overview',
        data: {
          headerTitleKey: 'overview.header-title'
        }
      },
      {
        path: 'performance',
        loadComponent: () => import('./pages/performance/performance.component').then((component) => component.PerformanceComponent),
        title: 'SalesCompass - Performance Dashboards',
        data: {
          headerTitleKey: 'performance.header-title'
        }
      },
      {
        path: 'report-builder',
        loadComponent: () =>
          import('./pages/report-builder/report-builder.component').then((component) => component.ReportBuilderComponent),
        title: 'SalesCompass - Report Builder',
        data: {
          headerTitleKey: 'report-builder.header-title'
        }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'overview'
  }
];
