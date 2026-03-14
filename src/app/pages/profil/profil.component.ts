import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface AdminProfile {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-profil">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Profil Administrateur</h1>
          <p class="page-subtitle">Gérez votre compte</p>
        </div>
      </div>

      <div class="profile-container">
        <!-- Profile Card -->
        <div class="card profile-card">
          <div class="profile-header">
            <div class="avatar">
              <span class="initials">{{ getInitials() }}</span>
            </div>
            <div class="profile-info">
              <h2>{{ adminProfile.nom }} {{ adminProfile.prenom }}</h2>
              <p class="role">{{ adminProfile.role }}</p>
              <p class="email">{{ adminProfile.email }}</p>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-row">
              <label>Prénom</label>
              <span>{{ adminProfile.prenom }}</span>
            </div>
            <div class="detail-row">
              <label>Nom</label>
              <span>{{ adminProfile.nom }}</span>
            </div>
            <div class="detail-row">
              <label>Email</label>
              <span>{{ adminProfile.email }}</span>
            </div>
            <div class="detail-row">
              <label>Téléphone</label>
              <span>{{ adminProfile.telephone || 'Non fourni' }}</span>
            </div>
            <div class="detail-row">
              <label>Rôle</label>
              <span class="badge badge-admin">{{ adminProfile.role }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn btn-primary" (click)="openPasswordModal()">
              Modifier le mot de passe
            </button>
            <button class="btn btn-secondary" (click)="logout()">
              Se déconnecter
            </button>
          </div>
        </div>

        <!-- Settings Card -->
        <div class="card settings-card">
          <h3>Paramètres</h3>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <h4>Notifications par email</h4>
                <p>Recevez les alertes critiques par email</p>
              </div>
              <div class="toggle">
                <input type="checkbox" id="notifications" checked>
                <label for="notifications"></label>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <h4>Mode sombre</h4>
                <p>Activer le thème sombre (bientôt disponible)</p>
              </div>
              <div class="toggle">
                <input type="checkbox" id="darkmode" disabled>
                <label for="darkmode"></label>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <h4>Sessions actives</h4>
                <p>Gérer les sessions de connexion</p>
              </div>
              <button class="btn btn-sm btn-secondary">Voir</button>
            </div>
          </div>
        </div>

        <!-- Activity Card -->
        <div class="card activity-card">
          <h3>Activité récente</h3>
          <div class="activity-list">
            @for (activity of recentActivity; track activity.id) {
              <div class="activity-item">
                <div class="activity-icon">{{ activity.icon }}</div>
                <div class="activity-content">
                  <p class="activity-title">{{ activity.title }}</p>
                  <p class="activity-time">{{ activity.time }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Password Change Modal -->
      @if (showPasswordModal()) {
        <div class="modal-overlay" (click)="showPasswordModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Modifier le mot de passe</h2>
              <button class="btn-close" (click)="showPasswordModal.set(false)">✕</button>
            </div>
            <form [formGroup]="passwordForm" (ngSubmit)="submitPasswordChange()" class="modal-form">
              <div class="form-group">
                <label>Mot de passe actuel</label>
                <div class="password-field">
                  <input
                    [type]="showCurrentPassword() ? 'text' : 'password'"
                    formControlName="currentPassword"
                    placeholder="••••••••"
                    required>
                  <button
                    type="button"
                    class="toggle-password"
                    (click)="showCurrentPassword.set(!showCurrentPassword())">
                    {{ showCurrentPassword() ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Nouveau mot de passe</label>
                <div class="password-field">
                  <input
                    [type]="showNewPassword() ? 'text' : 'password'"
                    formControlName="newPassword"
                    placeholder="••••••••"
                    required>
                  <button
                    type="button"
                    class="toggle-password"
                    (click)="showNewPassword.set(!showNewPassword())">
                    {{ showNewPassword() ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Confirmer le mot de passe</label>
                <div class="password-field">
                  <input
                    [type]="showConfirmPassword() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    required>
                  <button
                    type="button"
                    class="toggle-password"
                    (click)="showConfirmPassword.set(!showConfirmPassword())">
                    {{ showConfirmPassword() ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="showPasswordModal.set(false)">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="!passwordForm.valid">Modifier</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-profil {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .page-header {
      margin-bottom: var(--spacing-lg);
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--sotral-vert);
      font-family: var(--font-primary);
    }

    .page-subtitle {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #999;
    }

    .profile-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--spacing-lg);
    }

    .profile-card {
      grid-row: 1 / 3;

      @media (max-width: 1024px) {
        grid-row: auto;
      }
    }

    .profile-header {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid #e0e0e0;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--sotral-vert) 0%, #158430 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .initials {
      color: white;
      font-size: 24px;
      font-weight: 700;
      font-family: var(--font-primary);
    }

    .profile-info h2 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--sotral-vert);
      font-family: var(--font-primary);
    }

    .role {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .email {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #666;
    }

    .profile-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid #f0f0f0;

      label {
        font-weight: 600;
        color: #666;
        font-size: 13px;
      }

      span {
        color: var(--sotral-vert);
        font-weight: 500;
      }

      .badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;

        &.badge-admin {
          background-color: #e3f2fd;
          color: #1976d2;
        }
      }
    }

    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;

      button {
        width: 100%;
      }
    }

    .settings-card h3,
    .activity-card h3 {
      margin: 0 0 var(--spacing-lg) 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--sotral-vert);
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: #f9f9f9;
      border-radius: var(--radius-md);
      gap: var(--spacing-md);
    }

    .setting-info h4 {
      margin: 0 0 4px 0;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .setting-info p {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .toggle {
      position: relative;
      display: inline-flex;
      align-items: center;

      input {
        display: none;

        &:checked + label::after {
          transform: translateX(20px);
          background-color: white;
        }

        &:checked + label {
          background-color: var(--sotral-vert);
        }

        &:disabled + label {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      label {
        width: 44px;
        height: 24px;
        background-color: #ccc;
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.3s;
        position: relative;
        display: block;

        &::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }
      }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: #f9f9f9;
      border-radius: var(--radius-md);
      border-left: 3px solid var(--sotral-vert);
    }

    .activity-icon {
      font-size: 20px;
      min-width: 24px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      margin: 0 0 2px 0;
      font-size: 13px;
      font-weight: 500;
      color: #333;
    }

    .activity-time {
      margin: 0;
      font-size: 11px;
      color: #999;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 450px;
      width: 90%;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid #e0e0e0;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--sotral-vert);
        font-family: var(--font-primary);
      }
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 4px;

      &:hover {
        color: #333;
      }
    }

    .modal-form {
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-weight: 600;
        font-size: 14px;
        color: #333;
      }
    }

    .password-field {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #e0e0e0;
      border-radius: var(--radius-md);
      padding: 0 12px;

      input {
        flex: 1;
        border: none;
        padding: 10px 0;
        font-size: 14px;
        font-family: var(--font-secondary);

        &:focus {
          outline: none;
        }
      }

      .toggle-password {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 0;

        &:hover {
          opacity: 0.7;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      padding-top: var(--spacing-md);
      border-top: 1px solid #e0e0e0;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      font-family: var(--font-secondary);

      &.btn-primary {
        background-color: var(--sotral-vert);
        color: white;

        &:hover:not(:disabled) {
          background-color: #158430;
          box-shadow: var(--shadow-md);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      &.btn-secondary {
        background-color: transparent;
        border: 2px solid #999;
        color: #333;

        &:hover {
          border-color: #333;
        }
      }

      &.btn-sm {
        padding: 6px 12px;
        font-size: 12px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilComponent {
  private fb = inject(FormBuilder);

  adminProfile: AdminProfile = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@sotral.tg',
    telephone: '+228 90 12 34 56',
    role: 'ADMINISTRATEUR',
  };

  showPasswordModal = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  passwordForm: FormGroup;

  recentActivity = [
    { id: 1, icon: '📊', title: 'Visualisation du tableau de bord', time: 'Aujourd\'hui à 14:30' },
    { id: 2, icon: '🚌', title: 'Modification d\'un bus', time: 'Aujourd\'hui à 12:15' },
    { id: 3, icon: '👤', title: 'Ajout d\'un nouvel utilisateur', time: 'Hier à 09:45' },
    { id: 4, icon: '🔐', title: 'Changement du mot de passe', time: 'Il y a 3 jours' },
  ];

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  openPasswordModal(): void {
    this.passwordForm.reset();
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.showPasswordModal.set(true);
  }

  submitPasswordChange(): void {
    if (!this.passwordForm.valid) return;
    // In real app: call AuthService to change password
    alert('Mot de passe modifié avec succès');
    this.showPasswordModal.set(false);
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // In real app: call AuthService.logout()
      window.location.href = '/auth/login';
    }
  }

  getInitials(): string {
    return (this.adminProfile.prenom[0] + this.adminProfile.nom[0]).toUpperCase();
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPwd = form.get('newPassword');
    const confirmPwd = form.get('confirmPassword');
    if (newPwd && confirmPwd && newPwd.value !== confirmPwd.value) {
      confirmPwd.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    return null;
  }
}
