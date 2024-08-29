import { Routes } from '@angular/router';
import { EmbeddedAiChartGeneratorComponent } from './pages/embedded-ai-chart-generator/embedded-ai-chart-generator.component';

const routeConfig: Routes = [
  {
    path: '',
    redirectTo: 'embedded-chart-generator',
    pathMatch: 'full'
  },
  {
    path: 'embedded-chart-generator',
    component: EmbeddedAiChartGeneratorComponent,
    pathMatch: 'full'
  }
];

export default routeConfig;
