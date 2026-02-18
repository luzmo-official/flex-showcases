import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Services
import { EmbedAuthService } from './services/embed-auth.service';
import { ChartStateService } from './services/chart-state.service';

// Components
import { HeaderComponent } from './header/header';
import { DashboardPanelComponent } from './dashboard-panel/dashboard-panel';
import { LuzmoChartComponent } from './luzmo-chart/luzmo-chart';
import { DateLevelToggleComponent } from './toggles/date-level-toggle';
import { SquadFilterToggleComponent } from './toggles/squad-filter-toggle';
import { PrLevelToggleComponent } from './toggles/pr-level-toggle';
import { TerminalChatComponent } from './terminal-chat/terminal-chat';

const BOOT_SEQUENCE_LINES = [
  { text: 'DEVOPS_COMMAND v1.0.0', delay: 0 },
  { text: 'Booting kernel...', delay: 200 },
  { text: '[OK] Core systems initialized', delay: 500 },
  { text: '[OK] Secure connection established', delay: 800 },
  { text: '[OK] Loading analytics engine...', delay: 1200 },
  { text: '[OK] Embedded dashboards ready', delay: 1700 },
  { text: '[OK] AI_CORE online', delay: 2100 },
  { text: 'All systems operational. Launching command centre...', delay: 2600 },
];

const BOOT_TOTAL_DURATION_MS = 3400;

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    DashboardPanelComponent,
    LuzmoChartComponent,
    DateLevelToggleComponent,
    SquadFilterToggleComponent,
    PrLevelToggleComponent,
    TerminalChatComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  // Services exposed to template
  protected readonly embedAuth = inject(EmbedAuthService);
  protected readonly chartState = inject(ChartStateService);

  // Local state
  protected readonly title = signal('devops_command');

  // Boot sequence state
  protected readonly bootTimerDone = signal(false);
  protected readonly bootLines = signal<string[]>([]);
  protected readonly isReady = computed(() => this.embedAuth.isAuthenticated() && this.bootTimerDone());

  private bootTimeouts: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.embedAuth.fetchCredentials();
    this.startBootSequence();
  }

  ngOnDestroy(): void {
    this.bootTimeouts.forEach(t => clearTimeout(t));
  }

  private startBootSequence(): void {
    for (const line of BOOT_SEQUENCE_LINES) {
      const t = setTimeout(() => {
        this.bootLines.update(lines => [...lines, line.text]);
      }, line.delay);
      this.bootTimeouts.push(t);
    }

    const done = setTimeout(() => {
      this.bootTimerDone.set(true);
    }, BOOT_TOTAL_DURATION_MS);
    this.bootTimeouts.push(done);
  }
}
