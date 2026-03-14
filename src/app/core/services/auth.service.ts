import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthLoginRequest, AuthLoginResponse, Compte } from '../../shared/models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<Compte | null>(null);
  private apiUrl = environment.apiUrl;
  private isBrowser: boolean;

  token$ = this.tokenSubject.asObservable();
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

    if (this.isBrowser) {
      const storedToken = localStorage.getItem('sotral_token');
      if (storedToken) {
        this.tokenSubject.next(storedToken);
      }

      const storedUser = localStorage.getItem('sotral_user');
      if (storedUser) {
        this.userSubject.next(JSON.parse(storedUser));
      }
    }
  }

  login(credentials: AuthLoginRequest): Observable<AuthLoginResponse> {
    return this.http
      .post<AuthLoginResponse>(`${this.apiUrl}/users/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          const user: Compte = {
            trackingId: response.trackingId,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
            phone: response.phone,
            role: (response.rolesList?.[0] as any) || 'ADMIN',
            country: response.country,
            active: response.active,
          };
          this.setUser(user);
        })
      );
  }

  setToken(token: string): void {
    this.tokenSubject.next(token);
    if (this.isBrowser) {
      localStorage.setItem('sotral_token', token);
    }
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  setUser(user: Compte): void {
    this.userSubject.next(user);
    if (this.isBrowser) {
      localStorage.setItem('sotral_user', JSON.stringify(user));
    }
  }

  getUser(): Compte | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    if (this.isBrowser) {
      localStorage.removeItem('sotral_token');
      localStorage.removeItem('sotral_user');
    }
  }
}
