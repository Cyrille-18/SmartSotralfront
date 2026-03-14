import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <!-- Bande verte décorative gauche -->
      <div class="login-decoration">
        <div class="decoration-content">
          <h2 class="decoration-title">SOTRAL</h2>
          <p class="decoration-subtitle">Gestion du réseau de transport</p>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="login-content">
        <div class="login-card">
          <!-- Logo et titre -->
          <div class="login-header">
            <div class="logo-circle">🌍</div>
            <h1 class="logo-title">SOTRAL</h1>
            <p class="logo-subtitle">Administration du réseau</p>
          </div>

          <!-- Formulaire -->
          <form [formGroup]="form" (ngSubmit)="onLogin()" class="login-form">
            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="admin@sotral.tg"
                class="form-input"
                autocomplete="email">
            </div>

            <!-- Mot de passe -->
            <div class="form-group">
              <label for="password" class="form-label">Mot de passe</label>
              <div class="password-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••••"
                  class="form-input"
                  autocomplete="current-password">
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  {{ showPassword() ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>

            <!-- Message d'erreur -->
            @if (errorMessage()) {
              <div class="alert alert-error" role="alert">
                @if (errorMessage() === 'network') {
                  <span>Erreur de connexion au serveur</span>
                } @else if (errorMessage() === 'invalid') {
                  <span>Identifiants incorrects</span>
                } @else {
                  <span>{{ errorMessage() }}</span>
                }
              </div>
            }

            <!-- Bouton connexion -->
            <button
              type="submit"
              class="btn-login"
              [disabled]="loading() || !form.valid">
              @if (loading()) {
                <span>Connexion en cours...</span>
              } @else {
                <span>SE CONNECTER</span>
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <p class="footer-text">Accès réservé aux administrateurs SOTRAL</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      height: 100vh;
      background-color: white;
    }

    .login-decoration {
      width: 40%;
      background: linear-gradient(135deg, var(--sotral-vert) 0%, var(--sotral-vert-dark) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      @media (max-width: 768px) {
        display: none;
      }
    }

    .login-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-lg);
    }

    .login-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .logo-circle {
      font-size: 48px;
      margin-bottom: 12px;
      display: block;
    }

    .logo-title {
      font-family: var(--font-primary);
      font-size: 28px;
      font-weight: 700;
      color: var(--sotral-vert);
      margin: 0 0 4px 0;
    }

    .logo-subtitle {
      font-size: 13px;
      color: #999;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--sotral-gris);
    }

    .form-input {
      padding: 12px 14px;
      border: 1px solid var(--sotral-gris-border);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-family: var(--font-secondary);
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--sotral-vert);
        box-shadow: 0 0 0 3px rgba(27, 122, 62, 0.1);
      }

      &::placeholder {
        color: #ccc;
      }
    }

    .password-wrapper {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      color: #999;
      transition: all 0.2s ease;

      &:hover {
        color: var(--sotral-vert);
      }
    }

    .alert {
      padding: 12px 14px;
      border-radius: var(--radius-md);
      font-size: 14px;
      text-align: center;
    }

    .alert-error {
      background-color: #F8D7DA;
      color: var(--sotral-rouge);
      border: 1px solid #F5C6CB;
    }

    .btn-login {
      padding: 12px 16px;
      background-color: var(--sotral-vert);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: var(--font-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.2s ease;
      margin-top: 8px;

      &:hover:not(:disabled) {
        background-color: var(--sotral-vert-dark);
        box-shadow: var(--shadow-md);
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .login-footer {
      margin-top: var(--spacing-xl);
      text-align: center;
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--sotral-gris-border);
    }

    .footer-text {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .decoration-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      text-align: center;
    }

    .decoration-title {
      font-family: var(--font-primary);
      font-size: 48px;
      font-weight: 700;
      color: white;
      margin: 0;
      letter-spacing: 3px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .decoration-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .login-content {
        padding: 16px;
      }

      .login-card {
        padding: var(--spacing-lg);
      }

      .logo-title {
        font-size: 24px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup;
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin(): void {
    if (!this.form.valid) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    const credentials = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur de connexion:', err);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('invalid');
        } else {
          this.errorMessage.set('network');
        }
        this.loading.set(false);
      },
    });
  }
}
