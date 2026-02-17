import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalContainerComponent } from '../../components/modal/modal-container.component';
import { ModalRef, ModalService, MODAL_REF } from './modal.service';

@Component({
  standalone: true,
  template: '<div>Test modal content</div>'
})
class TestModalContentComponent {
  modalRef = inject(MODAL_REF);
}

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ModalService],
      imports: [ModalContainerComponent, TestModalContentComponent]
    });

    service = TestBed.inject(ModalService);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.cssText = '';
    vi.restoreAllMocks();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('opens a modal, injects ModalRef, and locks body scroll', () => {
    const modalRef = service.open(TestModalContentComponent);
    const instance = modalRef.componentInstance as TestModalContentComponent;

    expect(instance.modalRef).toBe(modalRef);
    expect(document.body.querySelector('app-modal-container')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes all modals and restores body scroll', async () => {
    const triggerCloseSpy = vi.spyOn(ModalContainerComponent.prototype, 'triggerClose').mockResolvedValue();

    service.open(TestModalContentComponent);
    await Promise.resolve();

    service.closeAll();
    await Promise.resolve();

    expect(triggerCloseSpy).toHaveBeenCalled();
    expect(document.body.querySelector('app-modal-container')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('replaces an existing modal when opening a new one', async () => {
    service.open(TestModalContentComponent);
    await Promise.resolve();
    const firstContainer = document.body.querySelector('app-modal-container');

    service.open(TestModalContentComponent);
    await Promise.resolve();

    const containers = document.body.querySelectorAll('app-modal-container');

    expect(containers.length).toBe(1);
    expect(firstContainer && document.body.contains(firstContainer)).toBe(false);
  });

  it('ModalRef emits a result and invokes the close callback', () => {
    const modalRef = new ModalRef<unknown, string>();
    const closeCallback = vi.fn();
    const dismissCallback = vi.fn();
    const results: string[] = [];
    let completed = false;

    modalRef.afterClosed$.subscribe({
      next: (result) => results.push(result),
      complete: () => {
        completed = true;
      }
    });

    modalRef._setCallbacks(closeCallback, dismissCallback);

    modalRef.close('done');

    expect(results).toEqual(['done']);
    expect(completed).toBe(true);
    expect(closeCallback).toHaveBeenCalledWith('done');
    expect(dismissCallback).not.toHaveBeenCalled();
  });

  it('ModalRef completes without a result on dismiss', () => {
    const modalRef = new ModalRef<unknown, string>();
    const closeCallback = vi.fn();
    const dismissCallback = vi.fn();
    const results: string[] = [];
    let completed = false;

    modalRef.afterClosed$.subscribe({
      next: (result) => results.push(result),
      complete: () => {
        completed = true;
      }
    });

    modalRef._setCallbacks(closeCallback, dismissCallback);

    modalRef.dismiss();

    expect(results).toEqual([]);
    expect(completed).toBe(true);
    expect(dismissCallback).toHaveBeenCalled();
    expect(closeCallback).not.toHaveBeenCalled();
  });
});
