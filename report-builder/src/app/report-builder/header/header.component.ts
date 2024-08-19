import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LocalStorage } from 'src/app/shared/services/storage.service';
import { ChartService } from '../shared/services/chart.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Chart } from '../shared/models/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterModule, MatInputModule, FormsModule, MatMenuModule, MatDividerModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly localStorage = inject<Storage>(LocalStorage);
  private readonly chartService = inject<ChartService>(ChartService);
  reportName = 'My report';
  savedReports = this.getSavedReports();
  saveButtonEnabled = computed(() => this.chartService.slots().some(slot => slot.content.length > 0));

  saveReport(): void {
    this.localStorage.setItem(
      `savedReports`,
      JSON.stringify([
        ...this.getSavedReports(),
        {
          name: this.reportName,
          chart: {
            type: this.chartService.type(),
            slots: this.chartService.slots(),
            options: this.chartService.options(),
            filters: this.chartService.filters(),
            filterOperator: this.chartService.filterOperator(),
          }
        }])
    );

    this.savedReports = this.getSavedReports();
  }

  loadReport(report: { name: string; chart: Chart & { filterOperator: 'and' | 'or' } }): void {
    if (report) {
      if (report.name) {
        this.reportName = report.name;
      }

      if (report.chart) {
        this.chartService.updateType(report.chart.type);
        this.chartService.updateSlots(report.chart.slots);
        this.chartService.updateOptions(report.chart.settings);
        this.chartService.updateFilters(report.chart.filters);
        this.chartService.setFilterOperator(report.chart.filterOperator);
      }
    }
  }

  deleteAllReports(): void {
    this.localStorage.removeItem('savedReports');
    this.savedReports = this.getSavedReports();
  }

  private getSavedReports(): { name: string; chart: Chart & { filterOperator: 'and' | 'or' } }[] {
    const savedReports = this.localStorage.getItem('savedReports');

    return savedReports ? JSON.parse(savedReports) : [];
  }

}
