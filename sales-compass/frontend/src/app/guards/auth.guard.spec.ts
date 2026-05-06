import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/auth/auth.service';
import { authGuard } from './auth.guard';

class AuthServiceStub {
  isLoggedIn = vi.fn();
}

class RouterStub {
  navigate = vi.fn().mockResolvedValue(true);
}

describe('authGuard', () => {
  let authService: AuthServiceStub;
  let router: RouterStub;

  beforeEach(() => {
    authService = new AuthServiceStub();
    router = new RouterStub();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: AuthService, useValue: authService }, { provide: Router, useValue: router }]
    });
  });

  it('should allow access when user is logged in', () => {
    authService.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to login when user is not logged in', () => {
    authService.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should call AuthService.isLoggedIn to check authentication status', () => {
    authService.isLoggedIn.mockReturnValue(true);

    TestBed.runInInjectionContext(() => authGuard(null!, null!));

    expect(authService.isLoggedIn).toHaveBeenCalledOnce();
  });
});
