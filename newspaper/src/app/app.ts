import { Component, afterNextRender, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxLuzmoVizItemComponent } from '@luzmo/ngx-embed';
import { switchItem } from '@luzmo/analytics-components-kit/utils';
import type { VizItemType } from '@luzmo/dashboard-contents-types';
import {
  COFFEE_CONSUMPTION_CHOROPLETH,
  CONSUMPTION_LINE_CHART,
  LATTE_PRICE_BAR_CHART,
  SPEND_VS_PRODUCTIVITY_SCATTER,
} from './charts.constant';

type MapRegion = 'europe' | 'north-america' | 'asia-pacific';
type ConsumptionChartType = 'line-chart' | 'column-chart';

const MAP_REGION_PINS: Record<MapRegion, { zoom: number; center: [number, number] }> = {
  'europe':        { zoom: 2.5, center: [54.76, 10.57] },
  'north-america': { zoom: 2,  center: [45.0, -100.0] },
  'asia-pacific':  { zoom: 3.5,  center: [36.0, 133.0] },
};

const REGION_COLUMN_ID = 'd34c49d9-8689-4e0f-a613-7add94d90b41';
const REGION_DATASET_ID = 'e9e0a228-01ba-4e4a-84c3-09e18ace55c3';

export const ALL_REGIONS = [
  'Anglo-Saxon',
  'Asia-Pacific',
  'Eastern Europe',
  'Latin America',
  'Northern Europe',
  'Other',
  'Southern Europe',
  'Western Europe',
] as const;

export const REGION_COLORS: Record<string, string> = {
  'Anglo-Saxon': 'rgb(26, 154, 165)',
  'Asia-Pacific': 'rgb(212, 163, 74)',
  'Eastern Europe': 'rgb(200, 65, 95)',
  'Latin America': 'rgb(195, 175, 155)',
  'Northern Europe': 'rgb(90, 195, 200)',
  'Other': 'rgb(175, 115, 70)',
  'Southern Europe': 'rgb(230, 190, 100)',
  'Western Europe': 'rgb(165, 60, 75)',
};

@Component({
  selector: 'app-root',
  imports: [NgxLuzmoVizItemComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly coffeeConsumptionChoropleth = signal(structuredClone(COFFEE_CONSUMPTION_CHOROPLETH));
  readonly consumptionLineChart = signal(structuredClone(CONSUMPTION_LINE_CHART));
  readonly lattePriceBarChart = signal(structuredClone(LATTE_PRICE_BAR_CHART));
  readonly spendVsProductivityScatter = signal(structuredClone(SPEND_VS_PRODUCTIVITY_SCATTER));

  readonly choroplethRegion = signal<MapRegion>('europe');
  readonly consumptionChartType = signal<ConsumptionChartType>('line-chart');
  readonly latteTopN = signal(20);
  readonly activeRegions = signal(new Set<string>(ALL_REGIONS));
  readonly scatterFilters = signal<any[]>([]);

  readonly allRegions = ALL_REGIONS;
  readonly regionColors = REGION_COLORS;

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

      const progressBar = document.querySelector('.reading-progress') as HTMLElement;
      if (progressBar) {
        const updateProgress = () => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          progressBar.style.width = `${Math.min(progress, 100)}%`;
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
      }
    });
  }

  zoomToRegion(region: MapRegion): void {
    if (this.choroplethRegion() === region) return;
    this.choroplethRegion.set(region);

    const chart = structuredClone(COFFEE_CONSUMPTION_CHOROPLETH);
    const pin = MAP_REGION_PINS[region];
    (chart.options as any).pin = { ...((chart.options as any).pin), zoom: pin.zoom, center: pin.center };
    this.coffeeConsumptionChoropleth.set(chart);
  }

  async switchConsumptionChartType(type: ConsumptionChartType): Promise<void> {
    if (this.consumptionChartType() === type) return;

    const base = structuredClone(CONSUMPTION_LINE_CHART);

    if (type === 'line-chart') {
      this.consumptionChartType.set(type);
      this.consumptionLineChart.set(base);
      return;
    }

    this.consumptionChartType.set(type);

    try {
      const switched = await switchItem({
        oldItemType: base.type,
        newItemType: type,
        slots: base.slots,
        options: base.options as Record<string, unknown>,
      });

      this.consumptionLineChart.set({
        type: switched.type as VizItemType,
        slots: switched.slots,
        options: {
          ...base.options,
          ...(switched.options ?? {}),
        },
      });
    } catch {
      this.consumptionChartType.set('line-chart');
      this.consumptionLineChart.set(base);
    }
  }

  setLatteTopN(n: number): void {
    if (n === null || isNaN(n)) return;
    const clamped = Math.max(1, Math.min(20, Math.round(n)));
    this.latteTopN.set(clamped);

    const chart = structuredClone(LATTE_PRICE_BAR_CHART);
    (chart.options as any).limit = { number: clamped };
    this.lattePriceBarChart.set(chart);
  }

  toggleRegion(region: string): void {
    const current = new Set(this.activeRegions());
    if (current.has(region)) {
      if (current.size > 1) current.delete(region);
    } else {
      current.add(region);
    }
    this.activeRegions.set(current);

    const selectedRegions = [...ALL_REGIONS].filter(r => current.has(r));
    if (selectedRegions.length < ALL_REGIONS.length) {
      this.scatterFilters.set([{
        condition: 'and',
        filters: [{
          expression: '? in ?',
          parameters: [
            { column_id: REGION_COLUMN_ID, dataset_id: REGION_DATASET_ID, level: 1 },
            selectedRegions,
          ],
        }],
      }]);
    } else {
      this.scatterFilters.set([]);
    }
  }

  isRegionActive(region: string): boolean {
    return this.activeRegions().has(region);
  }
}
