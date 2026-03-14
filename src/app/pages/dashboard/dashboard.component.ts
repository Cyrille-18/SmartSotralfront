import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DashboardStat {
  title: string;
  value: number;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'danger' | 'warning';
}

interface AlerteActive {
  immatriculation: string;
  ligne: string;
  statut: string;
  dernierStatut: string;
  heureStatut: string;
  type: 'panne' | 'retard';
}

interface TrajetDuJour {
  bus: string;
  ligne: string;
  conducteur: string;
  heureDepart: string;
  statut: string;
  type: 'planifié' | 'en_cours' | 'terminé';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Stats cards -->
      <div class="stats-grid">
        @for (stat of stats(); track stat.title) {
          <div [class]="'stat-card stat-' + stat.color">
            <div class="stat-header">
              <span class="stat-icon">{{ stat.icon }}</span>
              <h3 class="stat-title">{{ stat.title }}</h3>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        }
      </div>

      <!-- Main content -->
      <div class="dashboard-content">
        <!-- Left column - Alertes -->
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">Tableau des alertes actives</h2>
            <span class="alert-count">{{ alertes().length }} alertes</span>
          </div>

          @if (alertes().length > 0) {
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Immatriculation</th>
                    <th>Ligne</th>
                    <th>Dernier statut</th>
                    <th>Heure</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  @for (alerte of alertes(); track alerte.immatriculation) {
                    <tr>
                      <td class="bus-immatriculation">{{ alerte.immatriculation }}</td>
                      <td>{{ alerte.ligne }}</td>
                      <td class="status-text">{{ alerte.dernierStatut }}</td>
                      <td class="time-text">{{ alerte.heureStatut }}</td>
                      <td>
                        <span [class]="'badge badge-' + alerte.type">
                          @if (alerte.type === 'panne') {
                            🔴 Panne
                          }
                          @if (alerte.type === 'retard') {
                            🟠 Retard
                          }
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state">
              <p>✅ Aucune alerte - Tous les bus sont en service</p>
            </div>
          }
        </section>

        <!-- Right column - Trajets du jour -->
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">Trajets du jour</h2>
            <span class="detail-date">{{ currentDate() }}</span>
          </div>

          @if (trajets().length > 0) {
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Bus</th>
                    <th>Ligne</th>
                    <th>Conducteur</th>
                    <th>Départ</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  @for (trajet of trajets(); track trajet.bus) {
                    <tr>
                      <td class="bus-immatriculation">{{ trajet.bus }}</td>
                      <td>{{ trajet.ligne }}</td>
                      <td>{{ trajet.conducteur }}</td>
                      <td class="time-text">{{ trajet.heureDepart }}</td>
                      <td>
                        <span [class]="'badge badge-' + trajet.type">
                          @if (trajet.type === 'en_cours') {
                            ✅ En cours
                          }
                          @if (trajet.type === 'planifié') {
                            ⏳ Planifié
                          }
                          @if (trajet.type === 'terminé') {
                            ✔️ Terminé
                          }
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state">
              <p>Aucun trajet planifié pour aujourd'hui</p>
            </div>
          }
        </section>
      </div>

      <!-- Auto-refresh info -->
      <div class="refresh-info">
        🔄 Mise à jour automatique toutes les 10 secondes
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .stat-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      border-left: 4px solid;
    }

    .stat-primary { border-left-color: var(--sotral-vert); }
    .stat-success { border-left-color: #4CAF50; }
    .stat-danger { border-left-color: var(--sotral-rouge); }
    .stat-warning { border-left-color: var(--sotral-orange); }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .stat-icon {
      font-size: 24px;
    }

    .stat-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--sotral-gris);
      margin: 0;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--sotral-vert);
      margin-bottom: 4px;
    }

    .stat-danger .stat-value { color: var(--sotral-rouge); }

    .stat-label {
      font-size: 12px;
      color: #999;
    }

    /* Dashboard Content */
    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
    }

    @media (max-width: 1200px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    /* Card */
    .card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--sotral-gris-border);
    }

    .card-title {
      margin: 0;
      font-family: var(--font-primary);
      font-size: 18px;
      font-weight: 700;
      color: var(--sotral-vert);
    }

    .alert-count,
    .detail-date {
      font-size: 13px;
      color: #999;
      background-color: var(--sotral-blanc-casse);
      padding: 4px 12px;
      border-radius: var(--radius-md);
    }

    /* Table */
    .table-responsive {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .table thead {
      background-color: var(--sotral-blanc-casse);
    }

    .table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: var(--sotral-gris);
      border-bottom: 1px solid var(--sotral-gris-border);
    }

    .table td {
      padding: 12px;
      border-bottom: 1px solid var(--sotral-gris-border);
      color: var(--sotral-gris);
    }

    .table tr:hover {
      background-color: var(--sotral-blanc-casse);
    }

    .bus-immatriculation {
      font-weight: 600;
      color: var(--sotral-vert);
    }

    .time-text {
      color: #666;
      font-weight: 500;
    }

    .status-text {
      color: #666;
    }

    /* Badge */
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: var(--radius-md);
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-panne {
      background-color: #F8D7DA;
      color: var(--sotral-rouge);
    }

    .badge-retard {
      background-color: #FFF3CD;
      color: #856404;
    }

    .badge-en_cours {
      background-color: #D4EDDA;
      color: #155724;
    }

    .badge-planifié {
      background-color: #D1ECF1;
      color: #0C5460;
    }

    .badge-terminé {
      background-color: #E8F5E9;
      color: #2E7D32;
    }

    /* Empty state */
    .empty-state {
      padding: var(--spacing-lg);
      text-align: center;
      color: #999;
      background-color: var(--sotral-blanc-casse);
      border-radius: var(--radius-md);
      font-size: 14px;
    }

    /* Refresh info */
    .refresh-info {
      padding: 12px 16px;
      background-color: var(--sotral-blanc-casse);
      border-radius: var(--radius-md);
      font-size: 12px;
      color: #999;
      text-align: center;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .table {
        font-size: 12px;
      }

      .table th,
      .table td {
        padding: 8px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  // Données statiques pour la démo
  stats = signal<DashboardStat[]>([
    { title: 'Total Bus', value: 18, label: 'Dans le parc', icon: '🚌', color: 'primary' },
    { title: 'En service', value: 14, label: 'Actifs maintenant', icon: '✅', color: 'success' },
    { title: 'En panne', value: 2, label: 'Nécessitent intervention', icon: '🔴', color: 'danger' },
    { title: 'En retard', value: 2, label: 'À surveiller', icon: '🟠', color: 'warning' },
  ]);

  alertes = signal<AlerteActive[]>([
    {
      immatriculation: 'TG-5678-LM',
      ligne: 'Ligne 8',
      statut: 'EN_PANNE',
      dernierStatut: 'Moteur défaillant',
      heureStatut: '09:45',
      type: 'panne',
    },
    {
      immatriculation: 'TG-9012-LM',
      ligne: 'Ligne 3',
      statut: 'EN_RETARD',
      dernierStatut: 'Retard de 15 min',
      heureStatut: '10:30',
      type: 'retard',
    },
  ]);

  trajets = signal<TrajetDuJour[]>([
    {
      bus: 'TG-1234-LM',
      ligne: 'Ligne 3',
      conducteur: 'Kofi Amevor',
      heureDepart: '07:30',
      statut: 'En cours',
      type: 'en_cours',
    },
    {
      bus: 'TG-5678-LM',
      ligne: 'Ligne 8',
      conducteur: 'Yao Koffi',
      heureDepart: '08:00',
      statut: 'Planifié',
      type: 'planifié',
    },
    {
      bus: 'TG-2345-LM',
      ligne: 'Ligne 1',
      conducteur: 'Afi Mensah',
      heureDepart: '06:00',
      statut: 'Terminé',
      type: 'terminé',
    },
  ]);

  currentDate = computed(() => {
    const date = new Date();
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  ngOnInit(): void {
    // Rafraîchissement automatique toutes les 10 secondes
    setInterval(() => {
      // À implémenter avec les services réels
    }, 10000);
  }
}
