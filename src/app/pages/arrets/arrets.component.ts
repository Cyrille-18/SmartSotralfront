import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ArretService } from '../../core/services/arret.service';
import { Arret } from '../../shared/models/arret.model';

@Component({
  selector: 'app-arets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, ModalComponent, ConfirmDialogComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <p class="eyebrow">Arrêts</p>
          <h1>Points de desserte</h1>
          <p class="subtitle">Coordonnées GPS + rattachement aux lignes.</p>
        </div>
        <div class="actions">
          <button class="btn-secondary" (click)="refresh()">Rafraîchir</button>
          <button class="btn-primary" (click)="openForm()">Nouvel arrêt</button>
        </div>
      </div>
      <div class="content-grid">
        <div class="left-section">
          <app-data-table [data]="arrets" [columns]="columns">
            <ng-template #rowTemplate let-row>
              <tr>
                <td>{{ row.nom }}</td>
                <td>{{ row.latitude }}</td>
                <td>{{ row.longitude }}</td>
                <td class="actions-cell">
                  <button class="link" (click)="openForm(row)">Modifier</button>
                  <button class="link" (click)="demanderSuppression(row)">Supprimer</button>
                </td>
              </tr>
            </ng-template>
          </app-data-table>
        </div>
        <div class="right-section">
          <div class="map-placeholder">
            <p>Carte des arrêts (Leaflet)</p>
            <small>Centre Lomé. Cliquer pour préremplir latitude/longitude.</small>
          </div>
        </div>
      </div>

      <app-modal
        [title]="formTitle"
        [isOpen]="modalOuverte"
        (closed)="closeForm()">
        <form [formGroup]="arretForm" (ngSubmit)="enregistrer()" class="form-grid">
          <label>
            <span>Nom</span>
            <input formControlName="nom" placeholder="Gare routière" />
          </label>
          <label>
            <span>Latitude</span>
            <input type="number" step="0.0001" formControlName="latitude" />
          </label>
          <label>
            <span>Longitude</span>
            <input type="number" step="0.0001" formControlName="longitude" />
          </label>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeForm()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="arretForm.invalid">Enregistrer</button>
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

    .content-grid {
      display: grid;
      grid-template-columns: 60% 40%;
      gap: 16px;
    }

    .map-placeholder {
      background-color: var(--sotral-gris-l);
      border-radius: 4px;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--sotral-gris-b);
      flex-direction: column;
      gap: 6px;
    }

    .actions-cell { display: flex; gap: 12px; }
    .link { background: none; border: none; color: var(--sotral-vert); font-weight: 600; cursor: pointer; padding: 0; }
    .form-grid { display: grid; gap: 12px; }
    .form-grid label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: var(--sotral-noir); }
    .form-grid input { padding: 10px 12px; border-radius: 4px; border: 1px solid var(--sotral-gris-b); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
  `],
})
export class AretsComponent implements OnInit {
  private arretService = inject(ArretService);
  private fb = inject(FormBuilder);

  arrets: Arret[] = [];
  modalOuverte = false;
  dialogSuppression = false;
  arretSelectionne?: Arret;
  messageSuppression = 'Supprimer cet arrêt ?';
  formTitle = 'Nouvel arrêt';

  columns = [
    { label: 'Nom', key: 'nom' },
    { label: 'Latitude', key: 'latitude' },
    { label: 'Longitude', key: 'longitude' },
    { label: 'Actions', key: 'actions' },
  ];

  arretForm: FormGroup = this.fb.group({
    id: [null],
    nom: ['', Validators.required],
    latitude: [6.1375, Validators.required],
    longitude: [1.2123, Validators.required],
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.arretService.getAll().subscribe({
      next: data => (this.arrets = data),
      error: () => {
        this.arrets = [
          { id: 1, nom: 'Gare routière', latitude: 6.1375, longitude: 1.2123 },
          { id: 2, nom: 'Aéroport', latitude: 6.154, longitude: 1.246 },
        ];
      },
    });
  }

  openForm(arret?: Arret): void {
    this.arretSelectionne = arret;
    this.formTitle = arret ? `Modifier ${arret.nom}` : 'Nouvel arrêt';
    this.arretForm.reset({
      id: arret?.id ?? null,
      nom: arret?.nom ?? '',
      latitude: arret?.latitude ?? 6.1375,
      longitude: arret?.longitude ?? 1.2123,
    });
    this.modalOuverte = true;
  }

  closeForm(): void {
    this.modalOuverte = false;
    this.arretSelectionne = undefined;
  }

  enregistrer(): void {
    if (this.arretForm.invalid) return;
    const payload = this.arretForm.value as Arret;
    const action$ = payload.id
      ? this.arretService.update(payload.id, payload)
      : this.arretService.create(payload);

    action$.subscribe({
      next: () => { this.closeForm(); this.refresh(); },
      error: () => { this.closeForm(); this.refresh(); },
    });
  }

  demanderSuppression(arret: Arret): void {
    this.arretSelectionne = arret;
    this.messageSuppression = `Supprimer l'arrêt ${arret.nom} ?`;
    this.dialogSuppression = true;
  }

  supprimerConfirme(): void {
    if (!this.arretSelectionne?.id) { this.dialogSuppression = false; return; }
    this.arretService.delete(this.arretSelectionne.id).subscribe({
      next: () => { this.dialogSuppression = false; this.refresh(); },
      error: () => { this.dialogSuppression = false; this.refresh(); },
    });
  }
}
