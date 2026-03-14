import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ToastContainerComponent,
  ],
  template: `
    <div class="layout">
      <app-sidebar></app-sidebar>
      
      <div class="layout-main">
        <app-header 
          [title]="pageTitle()"
          [adminName]="adminName()">
        </app-header>
        
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
      background-color: var(--sotral-blanc-casse);
    }

    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 280px;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      margin-top: 70px;
      padding: var(--spacing-lg);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private authService = inject(AuthService);

  admin = signal(this.authService.getAdmin());
  pageTitle = signal('Tableau de bord');

  adminName = computed(() => {
    const admin = this.admin();
    if (admin) {
      const firstName = (admin as any).prenom || '';
      const lastName = (admin as any).nom || '';
      return `${firstName} ${lastName}`.trim() || 'Admin';
    }
    return 'Admin';
  });

  constructor() {
    // Mettre à jour le signal quand admin change
    this.authService.admin$.subscribe(admin => {
      this.admin.set(admin);
    });
  }
}
