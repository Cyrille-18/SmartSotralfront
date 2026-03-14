import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CompteService } from '../../core/services/compte.service';
import { Compte } from '../../shared/models/compte.model';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    ModalComponent,
    ConfirmDialogComponent,
    BadgeComponent,
  ],
  template: `
    <div>
      <div class="page-header">
        <div>
          <p class="eyebrow">Sécurité</p>
          <h1>Comptes</h1>
          <p class="subtitle">Admins et usagers avec statut en temps réel.</p>
        </div>
        <div class="actions">
          <button class="btn-secondary" (click)="refresh()">Rafraîchir</button>
          <button class="btn-primary" (click)="openForm()">Nouveau compte</button>
        </div>
      </div>
      <div class="filters">
        <button *ngFor="let f of filtres"
          [class.active]="filtreRole === f.value"
          (click)="setFiltre(f.value)">{{ f.label }}</button>
      </div>
      <app-data-table [data]="comptesFiltres" [columns]="columns">
        <ng-template #rowTemplate let-row>
          <tr>
            <td>{{ row.nom }}</td>
            <td>{{ row.email }}</td>
            <td><app-badge [value]="row.role" [type]="badgeRole(row.role)"></app-badge></td>
            <td>
              <button class="chip" [class.inactif]="row.statut === 'SUSPENDU'" (click)="toggleStatut(row)">
                {{ row.statut === 'ACTIF' ? 'Actif' : 'Suspendu' }}
              </button>
            </td>
            <td>{{ row.dateCreation | date:'shortDate' }}</td>
            <td class="actions-cell">
              <button class="link" (click)="openForm(row)">Modifier</button>
              <button class="link" (click)="demanderSuppression(row)">Supprimer</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table>

      <div class="pagination">
        <button (click)="prevPage()" [disabled]="page === 0">Précédent</button>
        <span>Page {{ page + 1 }}</span>
        <button (click)="nextPage()">Suivant</button>
      </div>

      <app-modal
        [title]="formTitle"
        [isOpen]="modalOuverte"
        (closed)="closeForm()">
        <form [formGroup]="compteForm" (ngSubmit)="enregistrer()" class="form-grid">
          <label><span>Nom</span><input formControlName="nom" /></label>
          <label><span>Email</span><input formControlName="email" type="email" /></label>
          <label><span>Rôle</span>
            <select formControlName="role">
              <option value="ADMIN">Admin</option>
              <option value="USAGER">Usager</option>
              <option value="CONDUCTEUR">Conducteur</option>
            </select>
          </label>
          <label *ngIf="!compteForm.value.id"><span>Mot de passe</span><input type="password" formControlName="motDePasse" /></label>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeForm()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="compteForm.invalid">Enregistrer</button>
          </div>
        </form>
      </app-modal>

      <app-confirm-dialog
        [isOpen]="dialogSuppression"
        [message]="messageSuppression"
        (confirmed)="supprimerConfirme()"
        (cancelled)="dialogSuppression = false">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .eyebrow { letter-spacing: 0.08em; text-transform: uppercase; color: var(--sotral-vert); font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: #637381; margin: 4px 0 0; }
    .actions { display: flex; gap: 12px; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .filters button { background-color: var(--sotral-gris-b); border: none; padding: 8px 16px; border-radius: 18px; cursor: pointer; }
    .filters button.active { background-color: var(--sotral-vert); color: var(--sotral-blanc); }
    .actions-cell { display: flex; gap: 12px; }
    .link { background: none; border: none; color: var(--sotral-vert); font-weight: 600; cursor: pointer; padding: 0; }
    .chip { border: 1px solid var(--sotral-gris-b); background: var(--sotral-blanc); border-radius: 14px; padding: 6px 10px; cursor: pointer; }
    .chip.inactif { background: var(--sotral-gris-l); }
    .form-grid { display: grid; gap: 12px; }
    .form-grid label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--sotral-noir); }
    .form-grid input, .form-grid select { padding: 10px 12px; border-radius: 4px; border: 1px solid var(--sotral-gris-b); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
    .pagination { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
  `],
})
export class ComptesComponent implements OnInit {
  private compteService = inject(CompteService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  comptes: Compte[] = [];
  comptesFiltres: Compte[] = [];
  filtreRole: string = 'TOUS';
  page = 0;

  filtres = [
    { label: 'Tous', value: 'TOUS' },
    { label: 'Admins', value: 'ADMIN' },
    { label: 'Usagers', value: 'USAGER' },
    { label: 'Conducteurs', value: 'CONDUCTEUR' },
  ];

  columns = [
    { label: 'Nom', key: 'nom' },
    { label: 'Email', key: 'email' },
    { label: 'Rôle', key: 'role' },
    { label: 'Statut', key: 'statut' },
    { label: 'Créé le', key: 'dateCreation' },
    { label: 'Actions', key: 'actions' },
  ];

  modalOuverte = false;
  dialogSuppression = false;
  formTitle = 'Nouveau compte';
  compteSelectionne?: Compte;
  messageSuppression = 'Supprimer ce compte ?';

  compteForm: FormGroup = this.fb.group({
    id: [null],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['USAGER', Validators.required],
    motDePasse: ['', Validators.minLength(6)],
    statut: ['ACTIF'],
    dateCreation: [new Date().toISOString()],
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.compteService.getAll().subscribe({
      next: data => { this.comptes = data; this.applyFilter(); },
      error: () => {
        this.comptes = [{
          id: 1, nom: 'Admin', email: 'admin@sotral.tg', role: 'ADMIN', statut: 'ACTIF', dateCreation: new Date().toISOString(),
        }];
        this.applyFilter();
        this.toast.warning('Comptes mock (API indisponible)');
      },
    });
  }

  setFiltre(role: string): void { this.filtreRole = role; this.applyFilter(); }

  applyFilter(): void {
    const filtered = this.filtreRole === 'TOUS'
      ? this.comptes
      : this.comptes.filter(c => c.role === this.filtreRole);
    this.comptesFiltres = filtered.slice(this.page * 10, this.page * 10 + 10);
  }

  nextPage(): void { this.page++; this.applyFilter(); }
  prevPage(): void { if (this.page > 0) { this.page--; this.applyFilter(); } }

  openForm(compte?: Compte): void {
    this.compteSelectionne = compte;
    this.formTitle = compte ? `Modifier ${compte.nom}` : 'Nouveau compte';
    this.compteForm.reset({
      id: compte?.id ?? null,
      nom: compte?.nom ?? '',
      email: compte?.email ?? '',
      role: compte?.role ?? 'USAGER',
      motDePasse: '',
      statut: compte?.statut ?? 'ACTIF',
      dateCreation: compte?.dateCreation ?? new Date().toISOString(),
    });
    this.modalOuverte = true;
  }

  closeForm(): void { this.modalOuverte = false; this.compteSelectionne = undefined; }

  enregistrer(): void {
    if (this.compteForm.invalid) return;
    const payload = this.compteForm.value as Compte;
    const action$ = payload.id
      ? this.compteService.update(payload.id, payload)
      : this.compteService.create(payload);
    action$.subscribe({
      next: () => { this.toast.success('Compte enregistré'); this.closeForm(); this.refresh(); },
      error: () => { this.toast.error('Erreur enregistrement'); this.closeForm(); this.refresh(); },
    });
  }

  toggleStatut(compte: Compte): void {
    if (!compte.id) return;
    const nouveau = compte.statut === 'ACTIF' ? 'SUSPENDU' : 'ACTIF';
    this.compteService.changeStatut(compte.id, nouveau).subscribe({
      next: () => { compte.statut = nouveau as any; this.applyFilter(); },
      error: () => this.toast.error('Impossible de changer le statut'),
    });
  }

  demanderSuppression(compte: Compte): void {
    this.compteSelectionne = compte;
    this.messageSuppression = `Supprimer ${compte.nom} ?`;
    this.dialogSuppression = true;
  }

  supprimerConfirme(): void {
    if (!this.compteSelectionne?.id) { this.dialogSuppression = false; return; }
    this.compteService.delete(this.compteSelectionne.id).subscribe({
      next: () => { this.toast.success('Compte supprimé'); this.dialogSuppression = false; this.refresh(); },
      error: () => { this.toast.error('Suppression impossible'); this.dialogSuppression = false; this.refresh(); },
    });
  }

  badgeRole(role: string): 'primary' | 'secondary' | 'info' {
    if (role === 'ADMIN') return 'primary';
    if (role === 'CONDUCTEUR') return 'info';
    return 'secondary';
  }
}
