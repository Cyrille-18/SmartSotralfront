import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bus, BusStatut } from '../../shared/models/bus.model';

interface DialogState {
  isOpen: boolean;
  isDelete: boolean;
  selectedBus: Bus | null;
}

@Component({
  selector: 'app-bus',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-bus">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Bus du réseau</h1>
          <p class="page-subtitle">Total: {{ busList().length }} bus</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          + Ajouter un bus
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="controls-bar">
        <input
          type="text"
          placeholder="Rechercher par immatriculation ou marque..."
          [(ngModel)]="searchTerm"
          class="search-input"
          aria-label="Rechercher un bus">

        <div class="status-filters">
          <button
            *ngFor="let statut of statusOptions"
            (click)="selectedStatus.set(statut.value)"
            [class.active]="selectedStatus() === statut.value"
            class="filter-btn">
            {{ statut.label }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Immatriculation</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Capacité</th>
              <th>Année</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (bus of filteredBusList(); track bus.id) {
              <tr>
                <td class="bus-immat">{{ bus.immatriculation }}</td>
                <td>{{ bus.marque }}</td>
                <td>{{ bus.modele }}</td>
                <td>{{ bus.capacite }} places</td>
                <td>{{ bus.annee }}</td>
                <td>
                  <span [class]="'status-badge status-' + bus.statut">
                    {{ getStatusLabel(bus.statut) }}
                  </span>
                </td>
                <td class="action-cell">
                  <button class="action-link" (click)="openEditModal(bus)" title="Modifier">
                    ✏️
                  </button>
                  <button class="action-link delete" (click)="openDeleteModal(bus)" title="Supprimer">
                    🗑️
                  </button>
                </td>
              </tr>
            } @empty {
              <tr class="empty-row">
                <td colspan="7" class="text-center">Aucun bus trouvé</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      @if (dialogState().isOpen && !dialogState().isDelete) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? 'Modifier le bus' : 'Ajouter un nouveau bus' }}</h2>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>

            <form [formGroup]="busForm" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-group">
                <label for="immatriculation">Immatriculation</label>
                <input
                  id="immatriculation"
                  type="text"
                  formControlName="immatriculation"
                  placeholder="TG-1234-LM"
                  required>
              </div>

              <div class="form-group">
                <label for="marque">Marque</label>
                <input
                  id="marque"
                  type="text"
                  formControlName="marque"
                  placeholder="Mercedes"
                  required>
              </div>

              <div class="form-group">
                <label for="modele">Modèle</label>
                <input
                  id="modele"
                  type="text"
                  formControlName="modele"
                  placeholder="Citaro"
                  required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="capacite">Capacité</label>
                  <input
                    id="capacite"
                    type="number"
                    formControlName="capacite"
                    placeholder="60"
                    required>
                </div>

                <div class="form-group">
                  <label for="annee">Année</label>
                  <input
                    id="annee"
                    type="number"
                    formControlName="annee"
                    placeholder="2019"
                    required>
                </div>
              </div>

              <div class="form-group">
                <label for="statut">Statut</label>
                <select id="statut" formControlName="statut" required>
                  <option value="EN_SERVICE">En service</option>
                  <option value="EN_PANNE">En panne</option>
                  <option value="HORS_SERVICE">Hors service</option>
                  <option value="EN_RETARD">En retard</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!busForm.valid || loading()">
                  {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (dialogState().isOpen && dialogState().isDelete) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content modal-small" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Confirmer la suppression</h2>
            </div>

            <div class="modal-body">
              <p>
                Voulez-vous vraiment supprimer le bus <strong>{{ dialogState().selectedBus?.immatriculation }}</strong> ?
              </p>
              <p class="warning-text">Cette action est irréversible.</p>
            </div>

            <div class="form-actions">
              <button class="btn btn-secondary" (click)="closeModal()">
                Annuler
              </button>
              <button class="btn btn-danger" (click)="confirmDelete()" [disabled]="loading()">
                {{ loading() ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-bus {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-lg);
    }

    .header-left h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--sotral-vert);
      font-family: var(--font-primary);
    }

    .page-subtitle {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #999;
    }

    .controls-bar {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      flex-wrap: wrap;
      align-items: center;
    }

    .search-input {
      flex: 1;
      min-width: 250px;
      padding: 10px 14px;
      border: 1px solid var(--sotral-gris-border);
      border-radius: var(--radius-md);
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: var(--sotral-vert);
        box-shadow: 0 0 0 3px rgba(27, 122, 62, 0.1);
      }
    }

    .status-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 12px;
      border: 1px solid var(--sotral-gris-border);
      background: white;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--sotral-vert);
        background-color: var(--sotral-blanc-casse);
      }

      &.active {
        background-color: var(--sotral-vert);
        color: white;
        border-color: var(--sotral-vert);
      }
    }

    .table-container {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .table thead {
      background-color: var(--sotral-blanc-casse);
      border-bottom: 2px solid var(--sotral-gris-border);
    }

    .table th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: var(--sotral-gris);
    }

    .table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--sotral-gris-border);
      color: var(--sotral-gris);
    }

    .table tbody tr {
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--sotral-blanc-casse);
      }
    }

    .bus-immat {
      font-weight: 600;
      color: var(--sotral-vert);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      min-width: 100px;
    }

    .status-EN_SERVICE {
      background-color: #D4EDDA;
      color: #155724;
    }

    .status-EN_PANNE {
      background-color: #F8D7DA;
      color: var(--sotral-rouge);
    }

    .status-HORS_SERVICE {
      background-color: #E2E3E5;
      color: #383d41;
    }

    .status-EN_RETARD {
      background-color: #FFF3CD;
      color: #856404;
    }

    .action-cell {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .action-link {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--sotral-blanc-casse);
      }

      &.delete:hover {
        background-color: #F8D7DA;
      }
    }

    .empty-row {
      background-color: var(--sotral-blanc-casse);
    }

    .text-center {
      text-align: center;
      color: #999;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.3s ease;

      &.modal-small {
        max-width: 400px;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--sotral-gris-border);

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--sotral-vert);
        font-family: var(--font-primary);
      }
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 4px;

      &:hover {
        color: var(--sotral-gris);
      }
    }

    .modal-form {
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-weight: 600;
        font-size: 14px;
        color: var(--sotral-gris);
      }

      input,
      select {
        padding: 10px 12px;
        border: 1px solid var(--sotral-gris-border);
        border-radius: var(--radius-md);
        font-size: 14px;
        font-family: var(--font-secondary);

        &:focus {
          outline: none;
          border-color: var(--sotral-vert);
          box-shadow: 0 0 0 3px rgba(27, 122, 62, 0.1);
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--sotral-gris-border);
    }

    .modal-body {
      padding: var(--spacing-lg);
      color: var(--sotral-gris);

      p {
        margin: 0 0 12px 0;

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: var(--sotral-vert);
        }
      }

      .warning-text {
        color: var(--sotral-rouge);
        font-size: 13px;
        font-weight: 500;
      }
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      font-family: var(--font-secondary);

      &.btn-primary {
        background-color: var(--sotral-vert);
        color: white;

        &:hover:not(:disabled) {
          background-color: var(--sotral-vert-dark);
          box-shadow: var(--shadow-md);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      &.btn-secondary {
        background-color: transparent;
        border: 2px solid var(--sotral-vert);
        color: var(--sotral-vert);

        &:hover {
          background-color: var(--sotral-blanc-casse);
        }
      }

      &.btn-danger {
        background-color: var(--sotral-rouge);
        color: white;

        &:hover:not(:disabled) {
          background-color: var(--sotral-rouge-light);
          box-shadow: var(--shadow-md);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .controls-bar {
        flex-direction: column;
      }

      .search-input {
        min-width: auto;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .table {
        font-size: 12px;
      }

      .table th,
      .table td {
        padding: 8px 12px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusComponent implements OnInit {
  private fb = inject(FormBuilder);

  busList = signal<Bus[]>([
    {
      id: 1,
      immatriculation: 'TG-1234-LM',
      marque: 'Mercedes',
      modele: 'Citaro',
      capacite: 60,
      annee: 2019,
      statut: 'EN_SERVICE',
    },
    {
      id: 2,
      immatriculation: 'TG-5678-LM',
      marque: 'Iveco',
      modele: 'Crossway',
      capacite: 45,
      annee: 2017,
      statut: 'EN_PANNE',
    },
    {
      id: 3,
      immatriculation: 'TG-9012-LM',
      marque: 'Scania',
      modele: 'OmniCity',
      capacite: 50,
      annee: 2020,
      statut: 'EN_SERVICE',
    },
  ]);

  searchTerm = signal('');
  selectedStatus = signal<BusStatut | 'TOUS'>('TOUS');
  loading = signal(false);
  isEditing = signal(false);

  dialogState = signal<DialogState>({
    isOpen: false,
    isDelete: false,
    selectedBus: null,
  });

  busForm: FormGroup;

  statusOptions = [
    { label: 'Tous', value: 'TOUS' as const },
    { label: 'En service', value: 'EN_SERVICE' as const },
    { label: 'En panne', value: 'EN_PANNE' as const },
    { label: 'Hors service', value: 'HORS_SERVICE' as const },
    { label: 'En retard', value: 'EN_RETARD' as const },
  ];

  filteredBusList = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();

    return this.busList().filter(bus => {
      const matchSearch =
        !search ||
        (bus.immatriculation ?? '').toLowerCase().includes(search) ||
        (bus.marque ?? '').toLowerCase().includes(search);

      const matchStatus = status === 'TOUS' || bus.statut === status;

      return matchSearch && matchStatus;
    });
  });

  constructor() {
    this.busForm = this.fb.group({
      immatriculation: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      capacite: [60, [Validators.required, Validators.min(1)]],
      annee: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
      statut: ['EN_SERVICE', Validators.required],
    });
  }

  ngOnInit(): void {
    // Charger les bus from API
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.busForm.reset({
      immatriculation: '',
      marque: '',
      modele: '',
      capacite: 60,
      annee: new Date().getFullYear(),
      statut: 'EN_SERVICE',
    });
    this.dialogState.set({ isOpen: true, isDelete: false, selectedBus: null });
  }

  openEditModal(bus: Bus): void {
    this.isEditing.set(true);
    this.busForm.patchValue(bus);
    this.dialogState.set({ isOpen: true, isDelete: false, selectedBus: bus });
  }

  openDeleteModal(bus: Bus): void {
    this.dialogState.set({ isOpen: true, isDelete: true, selectedBus: bus });
  }

  closeModal(): void {
    this.dialogState.set({ isOpen: false, isDelete: false, selectedBus: null });
  }

  onSubmit(): void {
    if (!this.busForm.valid) return;

    this.loading.set(true);

    const formValue = this.busForm.value as Bus;

    if (this.isEditing()) {
      const selectedBus = this.dialogState().selectedBus;
      if (selectedBus?.id) {
        const updated = this.busList().map(b =>
          b.id === selectedBus.id ? { ...b, ...formValue } : b
        );
        this.busList.set(updated);
      }
    } else {
      const newBus: Bus = {
        id: Math.max(...this.busList().map(b => b.id || 0), 0) + 1,
        ...formValue,
      };
      this.busList.set([...this.busList(), newBus]);
    }

    this.loading.set(false);
    this.closeModal();
  }

  confirmDelete(): void {
    const bus = this.dialogState().selectedBus;
    if (!bus?.id) return;

    this.loading.set(true);

    setTimeout(() => {
      this.busList.set(this.busList().filter(b => b.id !== bus.id));
      this.loading.set(false);
      this.closeModal();
    }, 500);
  }

  getStatusLabel(status?: BusStatut): string {
    const labels: Record<BusStatut, string> = {
      EN_SERVICE: '✅ En service',
      EN_PANNE: '🔴 En panne',
      HORS_SERVICE: '⚪ Hors service',
      EN_RETARD: '🟠 En retard',
    };
    return labels[status ?? 'EN_SERVICE'];
  }
}
