import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LigneService } from '../../core/services/ligne.service';
import { Ligne } from '../../shared/models/ligne.model';

@Component({
  selector: 'app-lignes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-lignes">
      <div class="page-header">
        <div>
          <p class="eyebrow">Lignes</p>
          <h1>Réseau des lignes</h1>
          <p class="subtitle">Gestion simplifiée basée sur les DTO backend</p>
        </div>
        <div class="actions">
          <button class="btn-secondary" (click)="load()">Rafraîchir</button>
          <button class="btn-primary" (click)="openAdd()">Nouvelle ligne</button>
        </div>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Départ</th>
              <th>Arrivée</th>
              <th>TrackingId</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (ligne of lignes(); track ligne.trackingId) {
              <tr>
                <td><strong>{{ ligne.numero }}</strong></td>
                <td>{{ ligne.depart }}</td>
                <td>{{ ligne.arrive }}</td>
                <td class="muted">{{ ligne.trackingId }}</td>
                <td class="actions-col">
                  <button class="link" (click)="openEdit(ligne)">Modifier</button>
                  <button class="link danger" (click)="remove(ligne)" [disabled]="loading()">Supprimer</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty">Aucune ligne</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingId() ? 'Modifier la ligne' : 'Nouvelle ligne' }}</h3>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>
            <form [formGroup]="ligneForm" (ngSubmit)="save()" class="form">
              <label>
                <span>Numéro</span>
                <input formControlName="numero" placeholder="L13" />
              </label>
              <label>
                <span>Départ</span>
                <input formControlName="depart" placeholder="Départ" />
              </label>
              <label>
                <span>Arrivée</span>
                <input formControlName="arrive" placeholder="Arrivée" />
              </label>
              <div class="actions">
                <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="ligneForm.invalid || loading()">
                  {{ loading() ? 'Enregistrement…' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-lignes { display: flex; flex-direction: column; gap: 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .eyebrow { text-transform: uppercase; color: #888; margin: 0; font-size: 12px; }
    h1 { margin: 0; color: var(--sotral-vert); }
    .subtitle { margin: 4px 0 0 0; color: #777; }
    .actions { display: flex; gap: 8px; }
    .card { background: #fff; border-radius: 12px; box-shadow: var(--shadow-sm); }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 12px 16px; border-bottom: 1px solid #eee; }
    .actions-col { width: 160px; text-align: right; }
    .link { background: none; border: none; color: var(--sotral-vert); cursor: pointer; }
    .danger { color: #c0392b; }
    .empty { text-align: center; padding: 16px; color: #777; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; }
    .modal { background: white; padding: 20px; border-radius: 12px; width: 420px; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .form { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
    label { display: flex; flex-direction: column; gap: 6px; }
    input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; }
    .btn-close { background: none; border: none; font-size: 18px; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LignesComponent implements OnInit {
  private ligneService = inject(LigneService);
  private fb = inject(FormBuilder);

  lignes = signal<Ligne[]>([]);
  loading = signal(false);
  modalOpen = signal(false);
  editingId = signal<string | null>(null);

  ligneForm: FormGroup = this.fb.group({
    numero: ['', Validators.required],
    depart: ['', Validators.required],
    arrive: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.ligneService.getAll().subscribe({
      next: lignes => this.lignes.set(lignes),
      error: () => this.lignes.set([]),
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.ligneForm.reset({ numero: '', depart: '', arrive: '' });
    this.modalOpen.set(true);
  }

  openEdit(ligne: Ligne): void {
    this.editingId.set(ligne.trackingId ?? null);
    this.ligneForm.reset({ numero: ligne.numero, depart: ligne.depart, arrive: ligne.arrive });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.ligneForm.reset();
  }

  save(): void {
    if (this.ligneForm.invalid) return;
    const payload = this.ligneForm.value as Ligne;
    this.loading.set(true);
    const req$ = this.editingId()
      ? this.ligneService.update(this.editingId()!, payload)
      : this.ligneService.create(payload);

    req$.subscribe({
      next: () => { this.loading.set(false); this.closeModal(); this.load(); },
      error: () => { this.loading.set(false); },
    });
  }

  remove(ligne: Ligne): void {
    if (!ligne.trackingId) return;
    this.loading.set(true);
    this.ligneService.delete(ligne.trackingId).subscribe({
      next: () => { this.loading.set(false); this.load(); },
      error: () => { this.loading.set(false); },
    });
  }
}
