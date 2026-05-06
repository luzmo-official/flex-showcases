import { Component, input, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly title = input.required<string>();

  private intervalId: ReturnType<typeof setInterval> | null = null;
  protected readonly currentTime = signal(this.formatTime());

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentTime.set(this.formatTime());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private formatTime(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
