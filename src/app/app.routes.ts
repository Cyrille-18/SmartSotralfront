import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Page de login (sans layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent),
  },

  // Toutes les pages protégées avec layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            m => m.DashboardComponent
          ),
      },
      {
        path: 'bus',
        loadComponent: () =>
          import('./pages/bus/bus.component').then(m => m.BusComponent),
      },
      {
        path: 'lignes',
        loadComponent: () =>
          import('./pages/lignes/lignes.component').then(
            m => m.LignesComponent
          ),
      },
      {
        path: 'missions',
        loadComponent: () =>
          import('./pages/missions/missions.component').then(
            m => m.MissionsComponent
          ),
      },
      {
        path: 'conducteurs',
        loadComponent: () =>
          import('./pages/conducteurs/conducteurs.component').then(
            m => m.ConducteursComponent
          ),
      },
      {
        path: 'carte',
        loadComponent: () =>
          import('./pages/carte/carte.component').then(
            m => m.CarteComponent
          ),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./pages/profil/profil.component').then(
            m => m.ProfilComponent
          ),
      },
      // Routes anciennes (compatibilité)
      {
        path: 'arrets',
        loadComponent: () =>
          import('./pages/arrets/arrets.component').then(
            m => m.AretsComponent
          ),
      },
      {
        path: 'comptes',
        loadComponent: () =>
          import('./pages/comptes/comptes.component').then(
            m => m.ComptesComponent
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.component').then(
            m => m.NotificationsComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
