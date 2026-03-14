import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../shared/models/notification.model';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DataTableComponent, BadgeComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <p class="eyebrow">Alertes</p>
          <h1>Notifications</h1>
          <p class="subtitle">Filtrer par statut, seuil, bus, arrêt.</p>
        </div>
        <div class="actions">
          <button class="btn-secondary" (click)="refresh()">Rafraîchir</button>
        </div>
      </div>

      <div class="filters">
        <div class="pill-group">
          <button *ngFor="let f of filtresStatut"
            [class.active]="filtreStatut === f.value"
            (click)="setFiltreStatut(f.value)">{{ f.label }}</button>
        </div>
        <div class="pill-group">
          <button *ngFor="let s of filtresSeuil"
            [class.active]="filtreSeuil === s.value"
            (click)="setFiltreSeuil(s.value)">{{ s.label }}</button>
        </div>
      </div>

      <app-data-table [data]="paged" [columns]="columns">
        <ng-template #rowTemplate let-row>
          <tr>
            <td>{{ row.dateEnvoi | date:'short' }}</td>
            <td>{{ row.compteId }}</td>
            <td>{{ row.busId }}</td>
            <td>{{ row.arretId }}</td>
            <td><app-badge [value]="row.seuil" [type]="badgeSeuil(row.seuil)"></app-badge></td>
            <td><app-badge [value]="row.statut" [type]="badgeStatut(row.statut)"></app-badge></td>
            <td class="actions-cell">
              <button class="link" *ngIf="row.statut === 'ECHEC'" (click)="reessayer(row)">Réessayer</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table>

      <div class="pagination">
        <button (click)="prevPage()" [disabled]="page===0">Précédent</button>
        <span>Page {{ page + 1 }}</span>
        <button (click)="nextPage()" [disabled]="(page+1)*pageSize >= filtered.length">Suivant</button>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .eyebrow { letter-spacing: 0.08em; text-transform: uppercase; color: var(--sotral-vert); font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: #637381; margin: 4px 0 0; }
    .actions { display: flex; gap: 12px; }
    .filters { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .pill-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill-group button { border: 1px solid var(--sotral-gris-b); background: var(--sotral-blanc); border-radius: 16px; padding: 6px 10px; cursor: pointer; }
    .pill-group button.active { background: var(--sotral-vert); color: var(--sotral-blanc); }
    .actions-cell { display: flex; gap: 12px; }
    .link { background: none; border: none; color: var(--sotral-vert); font-weight: 600; cursor: pointer; padding: 0; }
    .pagination { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
  `],
})
export class NotificationsComponent implements OnInit {
  private notifService = inject(NotificationService);
  private toast = inject(ToastService);

  notifications: Notification[] = [];
  filtered: Notification[] = [];
  paged: Notification[] = [];
  page = 0;
  pageSize = 10;
  filtreStatut: string = 'TOUS';
  filtreSeuil: string = 'TOUS';

  filtresStatut = [
    { label: 'Tous', value: 'TOUS' },
    { label: 'Envoyées', value: 'ENVOYEE' },
    { label: 'Échec', value: 'ECHEC' },
    { label: 'En attente', value: 'EN_ATTENTE' },
  ];
  filtresSeuil = [
    { label: 'Tous seuils', value: 'TOUS' },
    { label: '5km', value: '5km' },
    { label: '3km', value: '3km' },
    { label: '2km', value: '2km' },
    { label: '1km', value: '1km' },
  ];

  columns = [
    { label: 'Date', key: 'dateEnvoi' },
    { label: 'Compte', key: 'compteId' },
    { label: 'Bus', key: 'busId' },
    { label: 'Arrêt', key: 'arretId' },
    { label: 'Seuil', key: 'seuil' },
    { label: 'Statut', key: 'statut' },
    { label: 'Actions', key: 'actions' },
  ];

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.notifService.getAll(this.page, this.pageSize).subscribe({
      next: resp => {
        this.notifications = resp.content ?? resp;
        this.applyFilters();
      },
      error: () => {
        this.notifications = [{
          id: 1, compteId: 1, busId: 1, arretId: 1, seuil: '5km', statut: 'ENVOYEE', dateEnvoi: new Date().toISOString(),
        }];
        this.applyFilters();
        this.toast.warning('Notifications mock (API indisponible)');
      },
    });
  }

  setFiltreStatut(val: string): void { this.filtreStatut = val; this.applyFilters(); }
  setFiltreSeuil(val: string): void { this.filtreSeuil = val; this.applyFilters(); }

  applyFilters(): void {
    this.filtered = this.notifications.filter(n =>
      (this.filtreStatut === 'TOUS' || n.statut === this.filtreStatut) &&
      (this.filtreSeuil === 'TOUS' || n.seuil === this.filtreSeuil)
    );
    this.page = 0;
    this.updatePage();
  }

  updatePage(): void {
    this.paged = this.filtered.slice(this.page * this.pageSize, this.page * this.pageSize + this.pageSize);
  }

  nextPage(): void {
    if ((this.page + 1) * this.pageSize < this.filtered.length) { this.page++; this.updatePage(); }
  }

  prevPage(): void {
    if (this.page > 0) { this.page--; this.updatePage(); }
  }

  reessayer(row: Notification): void {
    if (!row.id) return;
    this.notifService.reessayer(row.id).subscribe({
      next: () => { this.toast.success('Ré-envoi demandé'); this.refresh(); },
      error: () => this.toast.error('Ré-envoi impossible'),
    });
  }

  badgeStatut(statut: any): 'primary' | 'success' | 'danger' | 'warning' {
    if (statut === 'ENVOYEE') return 'success';
    if (statut === 'ECHEC') return 'danger';
    if (statut === 'EN_ATTENTE') return 'warning';
    return 'primary';
  }

  badgeSeuil(seuil: any): 'info' | 'secondary' | 'primary' {
    if (seuil === '1km' || seuil === '2km') return 'info';
    if (seuil === '3km') return 'secondary';
    return 'primary';
  }
}
