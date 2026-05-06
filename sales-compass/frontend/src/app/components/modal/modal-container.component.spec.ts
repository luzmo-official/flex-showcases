import { Component, ComponentRef, EnvironmentInjector, createComponent } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalContainerComponent } from './modal-container.component';

@Component({
  standalone: true,
  template: '<div class="test-content">Test modal content</div>'
})
class TestContentComponent {}

const createMouseEvent = (target: HTMLElement, currentTarget: HTMLElement): MouseEvent => {
  const event = new MouseEvent('click', { bubbles: true });
  Object.defineProperty(event, 'target', { value: target });
  Object.defineProperty(event, 'currentTarget', { value: currentTarget });
  return event;
};

describe('ModalContainerComponent', () => {
  let fixture: ComponentFixture<ModalContainerComponent>;
  let component: ModalContainerComponent;
  let contentRef: ComponentRef<TestContentComponent> | null = null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalContainerComponent, TestContentComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalContainerComponent);
    component = fixture.componentInstance;
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    contentRef = createComponent(TestContentComponent, { environmentInjector });
    component.contentRef = contentRef;
  });

  afterEach(() => {
    contentRef?.destroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('inserts content and shows the modal after the entrance animation', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    component.contentRef?.changeDetectorRef.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.test-content')).toBeTruthy();

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');

    expect(backdrop.classList.contains('modal-backdrop--visible')).toBe(false);

    vi.runAllTimers();

    expect(component.isVisible).toBe(true);
    expect(backdrop.classList.contains('modal-backdrop--visible')).toBe(true);
  });

  it('applies size, centering, window class, and aria label bindings', () => {
    component.size = 'lg';
    component.centered = true;
    component.windowClass = 'custom-window';
    component.ariaLabel = 'Settings dialog';

    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.modal-dialog');

    expect(dialog.classList.contains('modal-dialog--lg')).toBe(true);
    expect(dialog.classList.contains('modal-dialog--centered')).toBe(true);
    expect(dialog.classList.contains('custom-window')).toBe(true);
    expect(dialog.getAttribute('aria-label')).toBe('Settings dialog');
  });

  it('triggers the exit animation and resolves after the duration', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.runAllTimers();

    component.isVisible = true;

    const resolvedSpy = vi.fn();
    const closePromise = component.triggerClose().then(resolvedSpy);

    expect(component.isVisible).toBe(false);

    vi.advanceTimersByTime(149);
    await Promise.resolve();
    expect(resolvedSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await closePromise;
    expect(resolvedSpy).toHaveBeenCalled();
  });

  it('emits closeRequested on escape press', () => {
    const emitSpy = vi.spyOn(component.closeRequested, 'emit');

    component.onEscapePress();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('emits closeRequested on backdrop click when enabled', () => {
    const emitSpy = vi.spyOn(component.closeRequested, 'emit');
    const backdrop = document.createElement('div');

    component.onBackdropClick(createMouseEvent(backdrop, backdrop));

    expect(emitSpy).toHaveBeenCalled();
  });

  it('does not emit closeRequested when clicking inside the dialog', () => {
    const emitSpy = vi.spyOn(component.closeRequested, 'emit');
    const backdrop = document.createElement('div');
    const dialog = document.createElement('div');

    component.onBackdropClick(createMouseEvent(dialog, backdrop));

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
