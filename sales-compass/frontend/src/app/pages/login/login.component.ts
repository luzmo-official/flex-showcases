import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService, User, availableUsers } from '../../services/auth/auth.service';
import { LanguageService } from '../../services/language/language.service';
import { LuzmoApiService } from '../../services/luzmo-api/luzmo-api.service';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styles: [
    `
      .user-card-container {
        &:hover {
          .user-card {
            &:not(.disabled):not(.selected) {
              filter: blur(0.0625rem);
              opacity: 0.7;
              transform: scale(0.975);
            }
          }
        }
      }

      .user-card {
        &.disabled {
          pointer-events: none;
          cursor: not-allowed;
          opacity: 0.4;
          filter: grayscale(0.3);

          &:hover {
            transform: none !important;
            filter: grayscale(0.3) !important;
            opacity: 0.4 !important;
          }
        }

        &:not(.disabled):hover,
        &.selected {
          transform: scale(1.025) !important;
          filter: none !important;
          opacity: 1 !important;
          background-color: rgba(var(--color-secondary-rgb), 0.3);
        }
      }

      .avatar-container {
        &.loading {
          &::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 270deg,
              rgba(var(--color-secondary-rgb), 1) 360deg
            );
            animation: spin-progress 1.5s linear infinite;
            z-index: 1;
          }

          &::after {
            content: '';
            position: absolute;
            inset: -3px;
            border-radius: 50%;
            background: rgba(var(--color-secondary-rgb), 0.2);
            z-index: 0;
          }

          .avatar-inner {
            animation: pulse-avatar 2s ease-in-out infinite;
            position: relative;
            z-index: 2;
          }
        }
      }

      @keyframes spin-progress {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse-avatar {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(0.98);
          opacity: 0.9;
        }
      }
    `
  ]
})
export class LoginComponent {
  private luzmoApiService = inject(LuzmoApiService);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  private languageService = inject(LanguageService);

  isLoggingIn = false;
  selectedUser: User | null = null;
  users = availableUsers;

  async login(user: User): Promise<void> {
    if (this.isLoggingIn) {
      return; // Prevent multiple login attempts
    }

    this.isLoggingIn = true;
    this.selectedUser = user;

    try {
      // Set the theme and language before requesting embed token!
      this.themeService.setAppTheme(user.appTheme);
      this.languageService.setLanguage(user.language);

      // First request Luzmo credentials and wait for completion
      const credentials = await firstValueFrom(this.luzmoApiService.requestLuzmoCredentials(user));

      // Only if credentials were successfully obtained, login the user
      if (credentials && credentials.key && credentials.token) {
        this.authService.login(user);
      } else {
        throw new Error('Failed to obtain valid Luzmo credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.isLoggingIn = false;
      this.selectedUser = null;
    }
  }
}
