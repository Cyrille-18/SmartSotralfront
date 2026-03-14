import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthLoginRequest, AuthLoginResponse, Compte } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<Compte | null>(null);

  token$ = this.tokenSubject.asObservable();
  user$ = this.userSubject.asObservable();

  constructor() {}

  login(credentials: AuthLoginRequest): Observable<AuthLoginResponse> {
    // Mock login: admin@sotral.tg with any password >= 6
    return new Observable(observer => {
      if (credentials.email === 'admin@sotral.tg' && (credentials.password?.length ?? 0) >= 6) {
        const mock: AuthLoginResponse = {
          trackingId: 'mock-track',
          token: 'mock-token',
          type: 'Bearer',
          firstName: 'Admin',
          lastName: 'SOTRAL',
          phone: '+22890000000',
          email: 'admin@sotral.tg',
          roles: 'ADMIN',
          rolesList: ['ADMIN'],
          country: 'TG',
          active: true,
        };
        this.setToken(mock.token);
        this.setUser({
          trackingId: mock.trackingId,
          firstName: mock.firstName,
          lastName: mock.lastName,
          email: mock.email,
          role: 'ADMIN',
          active: true,
        });
        observer.next(mock);
        observer.complete();
      } else {
        observer.error({ status: 401, message: 'Identifiants incorrects' });
      }
    });
  }

  setToken(token: string): void {
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  setUser(user: Compte): void {
    this.userSubject.next(user);
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
  }
}
