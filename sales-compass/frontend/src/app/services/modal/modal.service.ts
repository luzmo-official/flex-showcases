import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  Type
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ModalContainerComponent } from '../../components/modal/modal-container.component';

/** Options for opening a modal */
export interface ModalOptions {
  /** Size of the modal: 'sm' | 'md' | 'lg' | 'xl' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the modal should be centered vertically */
  centered?: boolean;
  /** Additional CSS class for the modal window */
  windowClass?: string;
  /** Whether clicking the backdrop should close the modal (default: true) */
  backdropClose?: boolean;
  /** ARIA label for the modal (used if no aria-labelledby is available) */
  ariaLabel?: string;
}

/** Injection token for providing ModalRef to modal content components */
export const MODAL_REF = new InjectionToken<ModalRef<unknown>>('ModalRef');

/**
 * Reference to an opened modal, providing access to the component instance and close methods.
 * @template T The type of the component rendered inside the modal
 * @template R The type of the result returned when the modal is closed
 */
export class ModalRef<T, R = unknown> {
  /** The component instance rendered inside the modal */
  componentInstance!: T;

  private readonly _afterClosedSubject = new Subject<R>();
  private _closeCallback?: (result?: R) => void;
  private _dismissCallback?: () => void;

  /** Observable that emits when the modal closes, with the optional result */
  get afterClosed$(): Observable<R> {
    return this._afterClosedSubject.asObservable();
  }

  /** @internal */
  _setCallbacks(closeCallback: (result?: R) => void, dismissCallback: () => void): void {
    this._closeCallback = closeCallback;
    this._dismissCallback = dismissCallback;
  }

  /** Close the modal with an optional result */
  close(result?: R): void {
    if (result !== undefined) {
      this._afterClosedSubject.next(result);
    }

    this._afterClosedSubject.complete();
    this._closeCallback?.(result);
  }

  /** Dismiss the modal without a result (e.g., backdrop click, escape key) */
  dismiss(): void {
    this._afterClosedSubject.complete();

    this._dismissCallback?.();
  }
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private envInjector = inject(EnvironmentInjector);

  private containerRef: ComponentRef<ModalContainerComponent> | null = null;
  private contentRef: ComponentRef<unknown> | null = null;
  private isClosing = false;

  /**
   * Open a modal with the given component
   * @param component The component type to render inside the modal
   * @param options Modal options (size, centered, windowClass, etc.)
   * @returns A ModalRef that provides access to the component instance and close methods
   */
  open<T, R = unknown>(component: Type<T>, options: ModalOptions = {}): ModalRef<T, R> {
    // Close any existing modal first (immediately, no animation)
    this.destroyModalImmediate();

    const modalRef = new ModalRef<T, R>();

    // Set up close/dismiss callbacks with animated close
    modalRef._setCallbacks(
      () => this.closeWithAnimation(),
      () => this.closeWithAnimation()
    );

    // Create custom injector that provides the ModalRef
    const modalInjector = Injector.create({
      providers: [{ provide: MODAL_REF, useValue: modalRef }],
      parent: this.injector
    });

    // Create the modal container
    this.containerRef = createComponent(ModalContainerComponent, {
      environmentInjector: this.envInjector,
      elementInjector: modalInjector
    });

    // Configure the container
    const container = this.containerRef.instance;

    // eslint-disable-next-line unicorn/explicit-length-check
    container.size = options.size || 'md';
    container.centered = options.centered ?? false;
    container.windowClass = options.windowClass || '';
    container.backdropClose = options.backdropClose ?? true;
    container.ariaLabel = options.ariaLabel || '';
    container.closeRequested.subscribe(() => modalRef.dismiss());

    // Create the content component inside the modal
    this.contentRef = createComponent(component, {
      environmentInjector: this.envInjector,
      elementInjector: modalInjector
    });

    modalRef.componentInstance = this.contentRef.instance as T;

    // Inject the content into the container
    container.contentRef = this.contentRef;

    // Attach container to the DOM (content will be inserted by the container's ViewContainerRef)
    document.body.append(this.containerRef.location.nativeElement);

    this.appRef.attachView(this.containerRef.hostView);

    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';

    // Defer change detection to next microtask so consumer can set component data first
    const containerRef = this.containerRef;

    void Promise.resolve().then(() => {
      if (containerRef && !containerRef.hostView.destroyed) {
        containerRef.changeDetectorRef.detectChanges();
      }

      return;
    });

    return modalRef;
  }

  /** Close all open modals */
  closeAll(): void {
    this.closeWithAnimation();
  }

  /** Close the modal with exit animation */
  private async closeWithAnimation(): Promise<void> {
    if (this.isClosing || !this.containerRef) {
      return;
    }

    this.isClosing = true;

    // Trigger fade-out animation and wait for it to complete
    await this.containerRef.instance.triggerClose();

    // Now destroy the modal
    this.destroyModalImmediate();
    this.isClosing = false;
  }

  /** Immediately destroy the modal without animation */
  private destroyModalImmediate(): void {
    // Content view is managed by the container's ViewContainerRef, so just destroy it
    if (this.contentRef) {
      this.contentRef.destroy();
      this.contentRef = null;
    }

    if (this.containerRef) {
      this.appRef.detachView(this.containerRef.hostView);
      this.containerRef.location.nativeElement.remove();
      this.containerRef.destroy();
      this.containerRef = null;
    }

    // Restore body scroll
    document.body.style.overflow = '';
  }
}
