import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface LuzmoEmbedCredentials {
  key: string;
  token: string;
}

interface LuzmoEmbedResponse {
  id: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class EmbedAuthService {
  private readonly http = inject(HttpClient);

  // Environment configuration
  readonly appServer = 'https://app.luzmo.com';
  readonly apiUrl = 'https://api.luzmo.com';

  // State
  private readonly embedResponse = signal<LuzmoEmbedResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(true);

  // Computed credentials from API response
  readonly credentials = computed<LuzmoEmbedCredentials>(() => {
    const response = this.embedResponse();
    return {
      key: response?.id ?? '',
      token: response?.token ?? ''
    };
  });

  // Check if authenticated
  readonly isAuthenticated = computed(() => {
    const response = this.embedResponse();
    return response !== null && response.id !== '' && response.token !== '';
  });

  /**
   * Fetch embed credentials from the backend
   */
  fetchCredentials(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const payload = {
      theme: 'default',
      user: {
        name: 'Test User',
        title: 'Sales Manager'
      },
      locale_id: 'en'
    };

    this.http.post<LuzmoEmbedResponse>('http://localhost:3101/api/embed', payload).subscribe({
      next: (response) => {
        this.embedResponse.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Embed error:', error);
        this.error.set(error?.message ?? 'Failed to call embed endpoint');
        this.isLoading.set(false);
      }
    });
  }
}
