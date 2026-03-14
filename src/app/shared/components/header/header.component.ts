import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="page-title">{{ title() }}</h1>
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text">{{ statusText() }}</span>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Notifications -->
        <button class="topbar-btn notifications-btn" [attr.aria-label]="'Notifications'">
          <span class="icon">🔔</span>
          @if (notificationCount() > 0) {
            <span class="badge">{{ notificationCount() }}</span>
          }
        </button>

        <!-- Admin profile -->
        <div class="admin-section">
          <span class="admin-name">{{ adminName() }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      position: fixed;
      top: 0;
      left: 280px;
      right: 0;
      height: 70px;
      background-color: var(--sotral-blanc);
      border-bottom: 1px solid var(--sotral-gris-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--spacing-lg);
      z-index: 999;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;
    }

    .page-title {
      font-family: var(--font-primary);
      font-size: 20px;
      font-weight: 700;
      color: var(--sotral-vert);
      margin: 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background-color: var(--sotral-blanc-casse);
      border-radius: var(--radius-md);
      font-size: 12px;
      color: #666;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #4CAF50;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .topbar-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      font-size: 18px;

      &:hover {
        background-color: var(--sotral-blanc-casse);
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background-color: var(--sotral-rouge);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
    }

    .admin-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 12px;
      border-left: 1px solid var(--sotral-gris-border);
    }

    .admin-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--sotral-gris);
    }

    @media (max-width: 768px) {
      .topbar {
        left: 0;
      }

      .status-indicator {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);

  title = input('Tableau de bord');
  adminName = input('Admin');
  notificationCount = signal(0);
  statusText = signal('12 bus actifs — 1 en panne');

  logout = output<void>();

  constructor() {
    // Mettre à jour les notifications depuis le service (à implémenter)
    this.notificationCount.set(3);
  }
}
