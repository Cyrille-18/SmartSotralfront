import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Mission, MissionStatut } from '../../shared/models/mission.model';

interface DialogState {
  isOpen: boolean;
  isDelete: boolean;
  selectedMission: Mission | null;
}

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-missions">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Gestion des Missions</h1>
          <p class="page-subtitle">Planification et suivi des trajets</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          + Planifier une mission
        </button>
      </div>

      <!-- Date Selector & Filters -->
      <div class="controls-bar">
        <div class="date-control">
          <label for="date-select">Date:</label>
          <input
            id="date-select"
            type="date"
            [(ngModel)]="selectedDate"
            class="date-input">
        </div>

        <div class="status-filters">
          <button
            *ngFor="let status of statusOptions"
            (click)="selectedStatus.set(status.value)"
            [class.active]="selectedStatus() === status.value"
            class="filter-btn">
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Ligne</th>
              <th>Conducteur</th>
              <th>Départ prévu</th>
              <th>Arrivée estimée</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (mission of filteredMissions(); track mission.id) {
              <tr>
                <td class="bus-immat">{{ mission.busTrackingId }}</td>
                <td>{{ mission.ligneTrackingId }}</td>
                <td>{{ mission.conducteurTrackingId }}</td>
                <td class="time-cell">{{ mission.heureDepart }}</td>
                <td class="time-cell">{{ mission.heureArriveeEstimee || '—' }}</td>
                <td>
                  <span [class]="'status-badge status-' + mission.statut">
                    {{ getStatusLabel(mission.statut) }}
                  </span>
                </td>
                <td class="action-cell">
                  <button class="action-link" (click)="openEditModal(mission)" title="Modifier">
                    ✏️
                  </button>
                  <button class="action-link delete" (click)="openDeleteModal(mission)" title="Supprimer">
                    🗑️
                  </button>
                </td>
              </tr>
            } @empty {
              <tr class="empty-row">
                <td colspan="7" class="text-center">Aucune mission pour cette date</td>
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
              <h2>{{ isEditing() ? 'Modifier la mission' : 'Planifier une mission' }}</h2>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>

            <form [formGroup]="missionForm" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-group">
                <label for="bus">Bus (EN_SERVICE uniquement)</label>
                <select id="bus" formControlName="busTrackingId" required>
                  <option value="">Sélectionner un bus</option>
                  <option value="TG-1234-LM">TG-1234-LM - Mercedes Citaro</option>
                  <option value="TG-2345-LM">TG-2345-LM - Scania OmniCity</option>
                </select>
              </div>

              <div class="form-group">
                <label for="ligne">Ligne</label>
                <select id="ligne" formControlName="ligneTrackingId" required>
                  <option value="">Sélectionner une ligne</option>
                  <option value="LIGNE-1">Ligne 1</option>
                  <option value="LIGNE-3">Ligne 3</option>
                  <option value="LIGNE-8">Ligne 8</option>
                </select>
              </div>

              <div class="form-group">
                <label for="conducteur">Conducteur (CONDUCTEUR uniquement)</label>
                <select id="conducteur" formControlName="conducteurTrackingId" required>
                  <option value="">Sélectionner un conducteur</option>
                  <option value="COND-001">Kofi Amevor</option>
                  <option value="COND-002">Yao Koffi</option>
                  <option value="COND-003">Afi Mensah</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="date">Date du trajet</label>
                  <input
                    id="date"
                    type="date"
                    formControlName="dateTrajet"
                    required>
                </div>

                <div class="form-group">
                  <label for="heure">Heure de départ</label>
                  <input
                    id="heure"
                    type="time"
                    formControlName="heureDepart"
                    required>
                </div>
              </div>

              <div class="form-group">
                <label for="statut">Statut</label>
                <select id="statut" formControlName="statut" required>
                  <option value="PLANIFIÉE">Planifiée</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINÉE">Terminée</option>
                  <option value="ANNULÉE">Annulée</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!missionForm.valid || loading()">
                  {{ loading() ? 'Enregistrement...' : 'Planifier' }}
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
              <h2>Confirmer l'annulation</h2>
            </div>

            <div class="modal-body">
              <p>
                Voulez-vous vraiment annuler cette mission ?
              </p>
              <p class="warning-text">Cette action ne peut pas être annulée.</p>
            </div>

            <div class="form-actions">
              <button class="btn btn-secondary" (click)="closeModal()">
                Conserver
              </button>
              <button class="btn btn-danger" (click)="confirmDelete()" [disabled]="loading()">
                {{ loading() ? 'Annulation...' : 'Annuler la mission' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-missions {
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

    .date-control {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-weight: 600;
        font-size: 14px;
        color: var(--sotral-gris);
      }
    }

    .date-input {
      padding: 8px 12px;
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

    .time-cell {
      font-weight: 500;
      color: #666;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      min-width: 90px;
    }

    .status-PLANIFIÉE {
      background-color: #D1ECF1;
      color: #0C5460;
    }

    .status-EN_COURS {
      background-color: #D4EDDA;
      color: #155724;
    }

    .status-TERMINÉE {
      background-color: #E8F5E9;
      color: #2E7D32;
    }

    .status-ANNULÉE {
      background-color: #F8D7DA;
      color: var(--sotral-rouge);
    }

    .action-cell {
      display: flex;
      gap: 8px;
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
export class MissionsComponent implements OnInit {
  private fb = inject(FormBuilder);

  missionsList = signal<Mission[]>([
    {
      id: 1,
      busTrackingId: 'TG-1234-LM',
      ligneTrackingId: 'LIGNE-3',
      conducteurTrackingId: 'COND-001',
      dateTrajet: new Date().toISOString().split('T')[0],
      heureDepart: '07:30',
      heureArriveeEstimee: '09:15',
      statut: 'EN_COURS',
    },
    {
      id: 2,
      busTrackingId: 'TG-2345-LM',
      ligneTrackingId: 'LIGNE-8',
      conducteurTrackingId: 'COND-002',
      dateTrajet: new Date().toISOString().split('T')[0],
      heureDepart: '08:00',
      heureArriveeEstimee: '10:00',
      statut: 'PLANIFIÉE',
    },
  ]);

  selectedDate = signal(new Date().toISOString().split('T')[0]);
  selectedStatus = signal<MissionStatut | 'TOUS'>('TOUS');
  loading = signal(false);
  isEditing = signal(false);

  dialogState = signal<DialogState>({
    isOpen: false,
    isDelete: false,
    selectedMission: null,
  });

  missionForm: FormGroup;

  statusOptions = [
    { label: 'Toutes', value: 'TOUS' as const },
    { label: 'Planifiée', value: 'PLANIFIÉE' as const },
    { label: 'En cours', value: 'EN_COURS' as const },
    { label: 'Terminée', value: 'TERMINÉE' as const },
    { label: 'Annulée', value: 'ANNULÉE' as const },
  ];

  filteredMissions = computed(() => {
    const date = this.selectedDate();
    const status = this.selectedStatus();

    return this.missionsList().filter(mission => {
      const matchDate = mission.dateTrajet === date;
      const matchStatus = status === 'TOUS' || mission.statut === status;
      return matchDate && matchStatus;
    });
  });

  constructor() {
    this.missionForm = this.fb.group({
      busTrackingId: ['', Validators.required],
      ligneTrackingId: ['', Validators.required],
      conducteurTrackingId: ['', Validators.required],
      dateTrajet: ['', Validators.required],
      heureDepart: ['', Validators.required],
      statut: ['PLANIFIÉE', Validators.required],
    });
  }

  ngOnInit(): void {
    // Charger les missions from API
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.missionForm.reset({
      busTrackingId: '',
      ligneTrackingId: '',
      conducteurTrackingId: '',
      dateTrajet: this.selectedDate(),
      heureDepart: '',
      statut: 'PLANIFIÉE',
    });
    this.dialogState.set({ isOpen: true, isDelete: false, selectedMission: null });
  }

  openEditModal(mission: Mission): void {
    this.isEditing.set(true);
    this.missionForm.patchValue(mission);
    this.dialogState.set({ isOpen: true, isDelete: false, selectedMission: mission });
  }

  openDeleteModal(mission: Mission): void {
    this.dialogState.set({ isOpen: true, isDelete: true, selectedMission: mission });
  }

  closeModal(): void {
    this.dialogState.set({ isOpen: false, isDelete: false, selectedMission: null });
  }

  onSubmit(): void {
    if (!this.missionForm.valid) return;

    this.loading.set(true);

    const formValue = this.missionForm.value as Mission;

    if (this.isEditing()) {
      const selected = this.dialogState().selectedMission;
      if (selected?.id) {
        const updated = this.missionsList().map(m =>
          m.id === selected.id ? { ...m, ...formValue } : m
        );
        this.missionsList.set(updated);
      }
    } else {
      const newMission: Mission = {
        id: Math.max(...this.missionsList().map(m => m.id || 0), 0) + 1,
        ...formValue,
      };
      this.missionsList.set([...this.missionsList(), newMission]);
    }

    this.loading.set(false);
    this.closeModal();
  }

  confirmDelete(): void {
    const mission = this.dialogState().selectedMission;
    if (!mission?.id) return;

    this.loading.set(true);

    setTimeout(() => {
      this.missionsList.set(this.missionsList().filter(m => m.id !== mission.id));
      this.loading.set(false);
      this.closeModal();
    }, 500);
  }

  getStatusLabel(status: MissionStatut): string {
    const labels: Partial<Record<MissionStatut, string>> = {
      PLANIFIÉE: '⏳ Planifiée',
      EN_COURS: '✅ En cours',
      TERMINÉE: '✔️ Terminée',
      TERMINEE: '✔️ Terminée',
      ANNULÉE: '❌ Annulée',
      ACTIVE: '✅ Active',
    };
    return labels[status] ?? '⏳ Planifiée';
  }
}
