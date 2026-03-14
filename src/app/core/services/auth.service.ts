import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthLoginRequest, AuthLoginResponse, Compte } from '../../shared/models/auth.model';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private adminSubject = new BehaviorSubject<Compte | null>(null);
  private apiUrl = environment.apiUrl;

  public token$ = this.tokenSubject.asObservable();
  public admin$ = this.adminSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedToken = this.getTokenFromMemory();
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
  }

  login(credentials: AuthLoginRequest): Observable<AuthLoginResponse> {
    // Mock authentication - accept admin@sotral.tg with any password >= 8 chars
    if (credentials.email === 'admin@sotral.tg' && credentials.password?.length >= 8) {
      const mockResponse: AuthLoginResponse = {
        trackingId: 'track-' + Date.now(),
        token: 'mock-jwt-token-' + Date.now(),
        type: 'Bearer',
        firstName: 'SOTRAL',
        lastName: 'Admin',
        phone: '+228 90 00 00 00',
        email: 'admin@sotral.tg',
        roles: 'ADMIN',
        rolesList: ['ADMIN'],
        country: 'TG',
        active: true,
        admin: {
          id: 1,
          nom: 'Admin',
          email: 'admin@sotral.tg'
        }
      };
      this.setToken(mockResponse.token);
      this.setAdmin(mockResponse.admin as any);
      return new Observable(observer => {
        observer.next(mockResponse);
        observer.complete();
      });
    }
    // Reject invalid credentials
    return new Observable(observer => {
      observer.error({ status: 401, message: 'Identifiants incorrects' });
    });
  }

  setToken(token: string): void {
    this.tokenSubject.next(token);
    // Stockage en mémoire (pas de localStorage)
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private getTokenFromMemory(): string | null {
    return this.tokenSubject.value;
  }

  setAdmin(admin: Compte): void {
    this.adminSubject.next(admin);
  }

  getAdmin(): Compte | null {
    return this.adminSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null && this.getToken() !== '';
  }

  logout(): void {
    this.tokenSubject.next(null);
    this.adminSubject.next(null);
  }
}
