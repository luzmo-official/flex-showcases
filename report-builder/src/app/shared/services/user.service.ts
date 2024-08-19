import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from, Subject, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { FrontendLanguage, BackendLanguage, AuthType } from '../models/common.model';
import { LocalStorage } from './storage.service';
import { environment } from 'src/environments/environment';

const API_HOST = environment.devConfig.apiHost;
const API_PORT = environment.devConfig.apiPort;

type AuthResponse = {
  user: {
    id: string;
    token: {
      cookieExpiry: string;
      id: string;
      token: string;
      tokenExpiry: Date;
      uid: string;
    };
    twoFactorAuthentication?: boolean;
    baseAppUrl?: string;
    baseApiUrl?: string;
  };
  error?: string;
};

type Preference = {
  frontend: FrontendLanguage;
  backend: BackendLanguage;
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: User = {
    authenticated: false,
    baseApiUrl: `${API_HOST}${API_PORT ? ':' + API_PORT : ''}`
  };
  user: Subject<User> = new BehaviorSubject(this._user);
  private _preference: Preference = { frontend: 'web', backend: 'javascript' };
  preference: Subject<Preference> = new BehaviorSubject(this._preference);

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    @Inject(LocalStorage) private localStorage: Storage,
    private httpClient: HttpClient
  ) {
    const authentication = this.localStorage?.getItem('authentication');
    const preference = this.localStorage?.getItem('preference');

    if (preference) {
      try {
        const pref = JSON.parse(preference);

        if (pref) {
          this._preference.frontend = pref.frontend;
          this._preference.backend = pref.backend;
          this.preference.next(this._preference);
        }
      }
      catch (error) {
        console.error(error);
      }
    }

    if (authentication) {
      try {
        const auth = JSON.parse(authentication);

        if (auth) {
          this._user = auth;
          this.user.next(this._user);
          this.fetchUser(auth.baseApiUrl, auth.key, auth.token, auth.userId).subscribe();
        }
      }
      catch (error) {
        console.error(error);
      }
    }
  }

  authenticate({ type, email, password, twoFAtoken, baseUrl, key, token }): Observable<any> {
    return from([type]).pipe(
      switchMap((authType: AuthType) =>
        (authType === 'api'
          ? this.performApiCall(baseUrl, key, token)
          : this.performLoginCall(baseUrl, email, password, twoFAtoken))
      ),
      switchMap((response) => {
        if (response?.key && response?.token && response?.uid) {
          let baseApiUrl = baseUrl;

          if (type !== 'api') {
            baseApiUrl = baseApiUrl.replace('https://app.', 'https://api.');
          }

          this._user.authType = response?.type;

          return this.fetchUser(baseApiUrl, response?.key, response?.token, response?.uid);
        }

        return of(response);
      }),
      catchError((error) => {
        const errorMsg = error?.error?.error || error?.error?.message || '';

        return of({ errorMsg });
      }),
      take(1)
    );
  }

  performLoginCall(baseAppUrl: string, email: string, password: string, twoFAtoken: string): Observable<any> {
    return this.httpClient
      .post<AuthResponse>(
      baseAppUrl + '/auth/vi',
      { email, password, token: twoFAtoken, useRecoveryCode: false },
      this.httpOptions
    )
      .pipe(
        map((response) => {
          const uid = response?.user?.token?.uid;
          const key = response?.user?.token?.id;
          const token = response?.user?.token?.token;

          this._user.key = key;
          this._user.token = token;
          this._user.baseApiUrl = baseAppUrl.replace('https://app.', 'https://api.');

          return { response, key, token, uid, type: 'login' };
        })
      );
  }

  performApiCall(baseApiUrl: string, key: string, token: string): Observable<any> {
    this._user.key = key;
    this._user.token = token;

    return this.httpClient
      .post<any>(
      baseApiUrl + '/0.1.0/authorization',
      { key, token, action: 'get', version: '0.1.0', find: { where: { id: key }, attributes: ['user_id'] } },
      this.httpOptions
    )
      .pipe(
        map((response) => {
          const uid = response?.rows?.[0]?.user_id;

          return { response, key, token, uid, type: 'api' };
        })
      );
  }

  fetchUser(baseApiUrl: string, key: string, token: string, uid: string): Observable<any> {
    return this.httpClient
      .post<AuthResponse>(
      baseApiUrl + '/0.1.0/user',
      { key, token, action: 'get', version: '0.1.0', find: { where: { id: uid }, attributes: ['name', 'email'] } },
      this.httpOptions
    )
      .pipe(
        catchError((error) => {
          const errorMsg = error?.error?.error || error?.error?.message || '';

          this.emptyAuthentication();

          return of({ rows: [], errorMsg });
        }),
        tap((response) => {
          if (response?.rows?.[0]?.id) {
            this._user.authenticated = true;
            this._user.email = response?.rows?.[0]?.email;
            this._user.name = response?.rows?.[0]?.name;
            this._user.userId = response?.rows?.[0]?.id;
            this._user.baseApiUrl = baseApiUrl;
            localStorage.setItem('authentication', JSON.stringify(this._user));
          }
          else {
            this.emptyAuthentication();
            this.localStorage.removeItem('authentication');
          }

          this.user.next(this._user);
        })
      );
  }

  emptyAuthentication(): void {
    this._user.authenticated = false;
    this._user.key = '';
    this._user.token = '';
    this._user.userId = '';
    this._user.name = '';
    this._user.email = '';
  }

  logOut(): void {
    this.emptyAuthentication();
    this.localStorage.removeItem('authentication');
    this.user.next(this._user);
  }

  setFrontendLanguage(language: FrontendLanguage): void {
    this._preference.frontend = language;
    this.localStorage.setItem('preference', JSON.stringify(this._preference));
    this.preference.next(this._preference);
  }

  setBackendLanguage(language: BackendLanguage): void {
    this._preference.backend = language;
    this.localStorage.setItem('preference', JSON.stringify(this._preference));
    this.preference.next(this._preference);
  }
}
