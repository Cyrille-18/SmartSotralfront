import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo">
          <span class="logo-icon">🌍</span>
          <span class="logo-text">SOTRAL</span>
        </div>
        <div class="logo-subtitle">Administration</div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          @for (item of navItems; track item.route) {
            <li class="nav-item">
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                class="nav-link">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- User Section -->
      <div class="sidebar-user">
        <div class="user-info">
          <div class="user-name">{{ adminName() }}</div>
          <button class="logout-btn" (click)="logout()">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 280px;
      height: 100vh;
      background-color: var(--sotral-vert);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      overflow-y: auto;
    }

    .sidebar-logo {
      padding: 24px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      color: #fff;
      font-family: var(--font-primary);
    }

    .logo-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 20px 0;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.active {
        background-color: rgba(255, 255, 255, 0.15);
        border-left-color: white;
        color: white;
        font-weight: 600;
      }
    }

    .nav-icon {
      font-size: 18px;
      min-width: 24px;
      display: flex;
      justify-content: center;
    }

    .nav-label {
      flex: 1;
    }

    .sidebar-user {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .user-name {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.95);
      font-weight: 600;
      word-break: break-word;
      line-height: 1.4;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: rgba(255, 255, 255, 0.15);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
      font-family: var(--font-secondary);

      &:hover {
        background-color: var(--sotral-rouge);
      }

      &:active {
        transform: scale(0.98);
      }
    }

    /* Scrollbar personnalisée */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  admin = signal(this.authService.getUser());

  adminName = computed(() => {
    const admin = this.admin();
    if (admin) {
      const firstName = admin.firstName || admin.nom || '';
      const lastName = admin.lastName || '';
      return `${firstName} ${lastName}`.trim() || admin.email || 'Admin';
    }
    return 'Admin';
  });

  navItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/dashboard', icon: '📊' },
    { label: 'Bus', route: '/bus', icon: '🚌' },
    { label: 'Lignes & Arrêts', route: '/lignes', icon: '🛣️' },
    { label: 'Missions', route: '/missions', icon: '📋' },
    { label: 'Conducteurs & Usagers', route: '/conducteurs', icon: '👥' },
    { label: 'Carte réseau', route: '/carte', icon: '🗺️' },
    { label: 'Profil', route: '/profil', icon: '👤' },
  ];

  constructor() {
    // Mettre à jour le signal quand admin change
    this.authService.user$.subscribe(admin => {
      this.admin.set(admin);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
