import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AffectationService } from '../../core/services/affectation.service';
import { Affectation } from '../../shared/models/affectation.model';

@Component({
  selector: 'app-affectations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <p class="eyebrow">Planning</p>
          <h1>Affectations</h1>
          <p class="subtitle">Associer bus, lignes et périodes.</p>
        </div>
        <div class="actions">
          <button class="btn-secondary" (click)="refresh()">Rafraîchir</button>
          <button class="btn-primary" (click)="openForm()">Nouvelle affectation</button>
        </div>
      </div>
      <app-data-table [data]="affectations" [columns]="columns">
        <ng-template #rowTemplate let-row>
          <tr>
            <td>{{ row.busId }}</td>
            <td>{{ row.ligneId }}</td>
            <td>{{ row.dateDebut | date:'short' }}</td>
            <td>{{ row.dateFin ? (row.dateFin | date:'short') : 'Active' }}</td>
            <td class="actions-cell">
              <button class="link" (click)="openForm(row)">Modifier</button>
              <button class="link" (click)="demanderSuppression(row)">Supprimer</button>
              <button class="link" *ngIf="!row.dateFin" (click)="terminer(row)">Terminer</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table>

      <app-modal
        [title]="formTitle"
        [isOpen]="modalOuverte"
        (closed)="closeForm()">
        <form [formGroup]="affForm" (ngSubmit)="enregistrer()" class="form-grid">
          <label>
            <span>Bus ID</span>
            <input type="number" formControlName="busId" placeholder="1" />
          </label>
          <label>
            <span>Ligne ID</span>
            <input type="number" formControlName="ligneId" placeholder="1" />
          </label>
          <label>
            <span>Date début</span>
            <input type="datetime-local" formControlName="dateDebut" />
          </label>
          <label>
            <span>Date fin</span>
            <input type="datetime-local" formControlName="dateFin" />
          </label>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeForm()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="affForm.invalid">Enregistrer</button>
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
    .actions-cell { display: flex; gap: 12px; }
    .link { background: none; border: none; color: var(--sotral-vert); font-weight: 600; cursor: pointer; padding: 0; }
    .form-grid { display: grid; gap: 12px; }
    .form-grid label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--sotral-noir); }
    .form-grid input { padding: 10px 12px; border-radius: 4px; border: 1px solid var(--sotral-gris-b); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
  `],
})
export class AffectationsComponent implements OnInit {
  private affectationService = inject(AffectationService);
  private fb = inject(FormBuilder);

  affectations: Affectation[] = [];
  modalOuverte = false;
  dialogSuppression = false;
  messageSuppression = 'Supprimer cette affectation ?';
  formTitle = 'Nouvelle affectation';
  affectationSelectionnee?: Affectation;

  columns = [
    { label: 'Bus', key: 'busId' },
    { label: 'Ligne', key: 'ligneId' },
    { label: 'Démarrage', key: 'dateDebut' },
    { label: 'Fin', key: 'dateFin' },
    { label: 'Actions', key: 'actions' },
  ];

  affForm: FormGroup = this.fb.group({
    id: [null],
    busId: [null, Validators.required],
    ligneId: [null, Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: [''],
    statut: ['ACTIVE'],
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.affectationService.getAll().subscribe({
      next: data => (this.affectations = data),
      error: () => {
        this.affectations = [
          { id: 1, busId: 1, ligneId: 1, dateDebut: new Date().toISOString(), statut: 'ACTIVE' } as Affectation,
        ];
      },
    });
  }

  openForm(aff?: Affectation): void {
    this.affectationSelectionnee = aff;
    this.formTitle = aff ? 'Modifier affectation' : 'Nouvelle affectation';
    this.affForm.reset({
      id: aff?.id ?? null,
      busId: aff?.busId ?? null,
      ligneId: aff?.ligneId ?? null,
      dateDebut: aff?.dateDebut ? this.toLocalDateTime(aff.dateDebut) : '',
      dateFin: aff?.dateFin ? this.toLocalDateTime(aff.dateFin) : '',
      statut: aff?.statut ?? 'ACTIVE',
    });
    this.modalOuverte = true;
  }

  closeForm(): void {
    this.modalOuverte = false;
    this.affectationSelectionnee = undefined;
  }

  enregistrer(): void {
    if (this.affForm.invalid) return;
    const payload = this.affForm.value as Affectation;
    const action$ = payload.id
      ? this.affectationService.update(payload.id, payload)
      : this.affectationService.create(payload);

    action$.subscribe({
      next: () => { this.closeForm(); this.refresh(); },
      error: () => { this.closeForm(); this.refresh(); },
    });
  }

  demanderSuppression(aff: Affectation): void {
    this.affectationSelectionnee = aff;
    this.messageSuppression = 'Supprimer cette affectation ?';
    this.dialogSuppression = true;
  }

  supprimerConfirme(): void {
    if (!this.affectationSelectionnee?.id) { this.dialogSuppression = false; return; }
    this.affectationService.delete(this.affectationSelectionnee.id).subscribe({
      next: () => { this.dialogSuppression = false; this.refresh(); },
      error: () => { this.dialogSuppression = false; this.refresh(); },
    });
  }

  terminer(aff: Affectation): void {
    if (!aff.id) return;
    this.affectationService.terminer(aff.id).subscribe({
      next: () => this.refresh(),
      error: () => this.refresh(),
    });
  }

  private toLocalDateTime(date: string | Date): string {
    const d = new Date(date);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  }
}
