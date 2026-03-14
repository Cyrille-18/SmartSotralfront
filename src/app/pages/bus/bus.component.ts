import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bus } from '../../shared/models/bus.model';

@Component({
  selector: 'app-bus',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-bus">
      <div class="page-header">
        <div>
          <p class="eyebrow">Bus</p>
          <h1>Flotte SOTRAL</h1>
          <p class="subtitle">Synchronisé sur le backend Spring (/api/bus)</p>
        </div>
        <div class="actions">
          <button class="btn-secondary" (click)="loadBuses()">Rafraîchir</button>
          <button class="btn-primary" (click)="openAdd()">Ajouter</button>
        </div>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>TrackingId</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (bus of busList(); track bus.trackingId) {
              <tr>
                <td><strong>{{ bus.code }}</strong></td>
                <td class="muted">{{ bus.trackingId }}</td>
                <td class="actions-col">
                  <button class="link" (click)="openEdit(bus)">Modifier</button>
                  <button class="link danger" (click)="delete(bus)" [disabled]="loading()">Supprimer</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="empty">Aucun bus</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingTrackingId() ? 'Modifier un bus' : 'Nouveau bus' }}</h3>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>
            <form [formGroup]="busForm" (ngSubmit)="save()" class="form">
              <label>
                <span>Code bus</span>
                <input formControlName="code" placeholder="BUS-001" />
              </label>
              <div class="actions">
                <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="busForm.invalid || loading()">
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
    .page-bus { display: flex; flex-direction: column; gap: 16px; }
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
    .modal { background: white; padding: 20px; border-radius: 12px; width: 360px; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .form { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
    label { display: flex; flex-direction: column; gap: 6px; }
    input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; }
    .btn-close { background: none; border: none; font-size: 18px; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusComponent implements OnInit {
  private fb = inject(FormBuilder);

  busList = signal<Bus[]>([
    { id: 1, trackingId: 'bus-1', code: 'BUS-101' },
    { id: 2, trackingId: 'bus-2', code: 'BUS-205' },
  ]);
  loading = signal(false);
  modalOpen = signal(false);
  editingTrackingId = signal<string | null>(null);

  busForm: FormGroup = this.fb.group({
    code: ['', Validators.required],
  });

  ngOnInit(): void {
    // données mock déjà en place
  }

  loadBuses(): void {
    // no-op in mock mode
  }

  openAdd(): void {
    this.editingTrackingId.set(null);
    this.busForm.reset({ code: '' });
    this.modalOpen.set(true);
  }

  openEdit(bus: Bus): void {
    this.editingTrackingId.set(bus.trackingId ?? null);
    this.busForm.reset({ code: bus.code });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.busForm.reset();
  }

  save(): void {
    if (this.busForm.invalid) return;
    const payload = this.busForm.value as Pick<Bus, 'code'>;
    this.loading.set(true);

    if (this.editingTrackingId()) {
      this.busList.update(list => list.map(b => b.trackingId === this.editingTrackingId() ? { ...b, ...payload } as Bus : b));
    } else {
      const nextId = Math.max(...this.busList().map(b => b.id ?? 0), 0) + 1;
      this.busList.update(list => [...list, { id: nextId, trackingId: `bus-${nextId}`, ...payload } as Bus]);
    }
    this.loading.set(false);
    this.closeModal();
  }

  delete(bus: Bus): void {
    this.busList.update(list => list.filter(b => b.trackingId !== bus.trackingId));
  }
}
