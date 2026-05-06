import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

/** Duration of the modal fade animation in milliseconds */
const ANIMATION_DURATION_MS = 150;

@Component({
  selector: 'app-modal-container',
  standalone: true,
  template: `
    <div
      class="modal-backdrop"
      [class.modal-backdrop--visible]="isVisible"
      (click)="onBackdropClick($event)">
      <div
        class="modal-dialog"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ariaLabel || null"
        [class.modal-dialog--centered]="centered"
        [class.modal-dialog--sm]="size === 'sm'"
        [class.modal-dialog--md]="size === 'md'"
        [class.modal-dialog--lg]="size === 'lg'"
        [class.modal-dialog--xl]="size === 'xl'"
        [class]="windowClass"
        (click)="$event.stopPropagation()">
        <div class="modal-content" #contentContainer>
          <ng-container #contentOutlet></ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1050;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 1.75rem;
      overflow-y: auto;
      opacity: 0;
      transition: opacity 150ms ease-out;
    }

    .modal-backdrop--visible {
      opacity: 1;
    }

    .modal-dialog {
      position: relative;
      width: 100%;
      margin: 0 auto;
      pointer-events: auto;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-large);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      transform: translateY(-20px);
      transition: transform 150ms ease-out;
    }

    .modal-backdrop--visible .modal-dialog {
      transform: translateY(0);
    }

    .modal-dialog--centered {
      margin-top: auto;
      margin-bottom: auto;
    }

    .modal-dialog--sm {
      max-width: 300px;
    }

    .modal-dialog--md {
      max-width: 500px;
    }

    .modal-dialog--lg {
      max-width: 800px;
    }

    .modal-dialog--xl {
      max-width: 1140px;
    }

    .modal-content {
      position: relative;
    }

    /* Bootstrap-compatible class names for existing modal content */
    :host ::ng-deep .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      position: relative;
    }

    :host ::ng-deep .modal-body {
      padding: 1.5rem;
    }

    :host ::ng-deep .modal-footer {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--color-border);
    }
  `
  ]
})
export class ModalContainerComponent implements AfterViewInit {
  @ViewChild('contentOutlet', { read: ViewContainerRef }) contentOutlet!: ViewContainerRef;
  @Output() closeRequested = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);

  size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  centered = false;
  windowClass = '';
  backdropClose = true;
  ariaLabel = '';
  isVisible = false;

  contentRef: ComponentRef<unknown> | null = null;

  ngAfterViewInit(): void {
    // Insert the content component into the outlet
    if (this.contentRef && this.contentOutlet) {
      this.contentOutlet.insert(this.contentRef.hostView);
    }

    // Trigger the fade-in animation after a brief delay
    // Use setTimeout to ensure we're in a new change detection cycle
    setTimeout(() => {
      this.isVisible = true;
      this.cdr.detectChanges();
    });
  }

  /**
   * Trigger the fade-out animation and resolve when complete.
   * Called by ModalService before destroying the component.
   */
  triggerClose(): Promise<void> {
    this.isVisible = false;
    this.cdr.detectChanges();

    return new Promise((resolve) => {
      setTimeout(resolve, ANIMATION_DURATION_MS);
    });
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeRequested.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.backdropClose && event.target === event.currentTarget) {
      this.closeRequested.emit();
    }
  }
}
