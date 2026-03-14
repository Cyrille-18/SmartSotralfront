import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Compte } from '../../shared/models/compte.model';

type RoleType = 'TOUS' | 'ADMIN' | 'CONDUCTEUR' | 'USAGER';

interface DialogState {
  isOpen: boolean;
  isDelete: boolean;
  selectedCompte: Compte | null;
}

@Component({
  selector: 'app-conducteurs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-conducteurs">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Conducteurs & Utilisateurs</h1>
          <p class="page-subtitle">Gérer les utilisateurs du système</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="header-controls">
            <div class="search-box">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                [(ngModel)]="searchTerm"
                class="search-input">
            </div>
            <div class="filters">
              @for (role of roles; track role) {
                <button
                  (click)="selectedRole.set(role)"
                  [class.active]="selectedRole() === role"
                  class="filter-btn">
                  {{ role }}
                </button>
              }
            </div>
          </div>
          <button class="btn btn-primary" (click)="openAddModal()">
            + Ajouter un utilisateur
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (compte of filteredComptes(); track compte.id) {
                <tr>
                  <td class="nom"><strong>{{ compte.nom }}</strong></td>
                  <td>{{ compte.prenom }}</td>
                  <td class="email">{{ compte.email }}</td>
                  <td class="phone">{{ compte.telephone }}</td>
                  <td>
                    <span [ngClass]="'badge badge-' + compte.role.toLowerCase()">
                      {{ roleBadgeText(compte.role) }}
                    </span>
                  </td>
                  <td>
                    <span [ngClass]="'badge badge-' + compte.statut.toLowerCase()">
                      {{ compte.statut }}
                    </span>
                  </td>
                  <td class="action-cell">
                    <button class="action-link" (click)="openEditModal(compte)" title="Modifier">✏️</button>
                    <button class="action-link delete" (click)="openDeleteModal(compte)" title="Supprimer">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr class="empty-row">
                  <td colspan="7" class="text-center">Aucun utilisateur trouvé</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (dialogState().isOpen && !dialogState().isDelete) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ dialogState().selectedCompte ? 'Modifier un utilisateur' : 'Ajouter un utilisateur' }}</h2>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>
            <form [formGroup]="compteForm" (ngSubmit)="submitForm()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Nom</label>
                  <input type="text" formControlName="nom" placeholder="Dupont" required>
                </div>
                <div class="form-group">
                  <label>Prénom</label>
                  <input type="text" formControlName="prenom" placeholder="Jean" required>
                </div>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" formControlName="email" placeholder="jean@sotral.tg" required>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" formControlName="telephone" placeholder="+228 9X XXX XXX">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Rôle</label>
                  <select formControlName="role" required>
                    <option value="ADMIN">Admin</option>
                    <option value="CONDUCTEUR">Conducteur</option>
                    <option value="USAGER">Usager</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select formControlName="statut" required>
                    <option value="ACTIF">Actif</option>
                    <option value="SUSPENDU">Suspendu</option>
                  </select>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="!compteForm.valid">
                  {{ dialogState().selectedCompte ? 'Modifier' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (dialogState().isOpen && dialogState().isDelete && dialogState().selectedCompte) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Confirmation de suppression</h2>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <p class="warning"><strong>{{ dialogState().selectedCompte!.prenom }} {{ dialogState().selectedCompte!.nom }}</strong></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="button" class="btn btn-danger" (click)="confirmDelete()">Supprimer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-conducteurs {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .page-header {
      margin-bottom: var(--spacing-lg);
    }

    .page-header h1 {
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

    .card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .card-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-lg);

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .header-controls {
      flex: 1;
      display: flex;
      gap: var(--spacing-md);
      flex-direction: column;

      @media (min-width: 769px) {
        flex-direction: row;
      }
    }

    .search-box {
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      border-radius: var(--radius-md);
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: var(--sotral-vert);
        box-shadow: 0 0 0 3px rgba(27, 122, 62, 0.1);
      }
    }

    .filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 500;
      font-size: 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--sotral-vert);
        color: var(--sotral-vert);
      }

      &.active {
        background-color: var(--sotral-vert);
        color: white;
        border-color: var(--sotral-vert);
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .table thead {
      background-color: #f5f5f5;
    }

    .table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #666;
      border-bottom: 1px solid #e0e0e0;
    }

    .table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
      color: #333;
    }

    .nom {
      font-weight: 600;
      color: var(--sotral-vert);
    }

    .email, .phone {
      font-size: 12px;
      color: #999;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;

      &.badge-admin {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      &.badge-conducteur {
        background-color: #f3e5f5;
        color: #7b1fa2;
      }

      &.badge-usager {
        background-color: #e8f5e9;
        color: #388e3c;
      }

      &.badge-actif {
        background-color: #e8f5e9;
        color: var(--sotral-vert);
      }

      &.badge-suspendu {
        background-color: #ffebee;
        color: #c62828;
      }
    }

    .action-cell {
      display: flex;
      gap: 8px;
    }

    .action-link {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: #f0f0f0;
      }

      &.delete:hover {
        background-color: #F8D7DA;
      }
    }

    .empty-row {
      background-color: #f9f9f9;
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
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 500px;
      width: 90%;

      &.modal-sm {
        max-width: 350px;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid #e0e0e0;

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
        color: #333;
      }
    }

    .modal-body {
      padding: var(--spacing-lg);
      color: #666;

      p {
        margin: 0 0 8px 0;

        &.warning {
          font-size: 14px;
          color: var(--sotral-rouge);
          margin-top: 8px;
        }
      }
    }

    .modal-footer {
      padding: var(--spacing-lg);
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
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
        color: #333;
      }

      input, select {
        padding: 10px 12px;
        border: 1px solid #e0e0e0;
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
      border-top: 1px solid #e0e0e0;
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
          background-color: #158430;
          box-shadow: var(--shadow-md);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      &.btn-secondary {
        background-color: transparent;
        border: 2px solid #999;
        color: #333;

        &:hover {
          border-color: #333;
        }
      }

      &.btn-danger {
        background-color: var(--sotral-rouge);
        color: white;

        &:hover {
          background-color: #a02828;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConducteursComponent {
  private fb = inject(FormBuilder);

  comptes = signal<Compte[]>([
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@sotral.tg',
      telephone: '+228 90 12 34 56',
      role: 'ADMIN',
      statut: 'ACTIF',
    },
    {
      id: 2,
      nom: 'Martin',
      prenom: 'Paul',
      email: 'paul.martin@sotral.tg',
      telephone: '+228 92 34 56 78',
      role: 'CONDUCTEUR',
      statut: 'ACTIF',
    },
    {
      id: 3,
      nom: 'Dubois',
      prenom: 'Marie',
      email: 'marie.dubois@sotral.tg',
      telephone: '+228 93 45 67 89',
      role: 'CONDUCTEUR',
      statut: 'ACTIF',
    },
    {
      id: 4,
      nom: 'Legrand',
      prenom: 'Sophie',
      email: 'sophie.legrand@sotral.tg',
      telephone: '+228 94 56 78 90',
      role: 'USAGER',
      statut: 'SUSPENDU',
    },
  ]);

  searchTerm = '';
  selectedRole = signal<RoleType>('TOUS');
  roles: RoleType[] = ['TOUS', 'ADMIN', 'CONDUCTEUR', 'USAGER'];

  dialogState = signal<DialogState>({
    isOpen: false,
    isDelete: false,
    selectedCompte: null,
  });

  compteForm: FormGroup;

  filteredComptes = computed(() => {
    const search = this.searchTerm.toLowerCase();
    const role = this.selectedRole();
    return this.comptes().filter(compte => {
      const matchSearch = !search ||
        compte.nom.toLowerCase().includes(search) ||
          (compte.prenom || '').toLowerCase().includes(search) ||
        compte.email.toLowerCase().includes(search);
      const matchRole = role === 'TOUS' || compte.role === role;
      return matchSearch && matchRole;
    });
  });

  constructor() {
    this.compteForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      role: ['CONDUCTEUR', Validators.required],
      statut: ['ACTIF', Validators.required],
    });
  }

  openAddModal(): void {
    this.compteForm.reset({ role: 'CONDUCTEUR', statut: 'ACTIF' });
    this.dialogState.set({ isOpen: true, isDelete: false, selectedCompte: null });
  }

  openEditModal(compte: Compte): void {
    this.compteForm.reset(compte);
    this.dialogState.set({ isOpen: true, isDelete: false, selectedCompte: compte });
  }

  openDeleteModal(compte: Compte): void {
    this.dialogState.set({ isOpen: true, isDelete: true, selectedCompte: compte });
  }

  closeModal(): void {
    this.dialogState.set({ isOpen: false, isDelete: false, selectedCompte: null });
  }

  submitForm(): void {
    if (!this.compteForm.valid) return;
    const formValue = this.compteForm.value;
    const current = this.dialogState().selectedCompte;

    if (current) {
      // Edit
      this.comptes.set(
        this.comptes().map(c =>
          c.id === current.id ? { ...c, ...formValue } : c
        )
      );
    } else {
      // Add
      const newCompte: Compte = {
        id: Math.max(...this.comptes().map(c => c.id || 0), 0) + 1,
        ...formValue,
      };
      this.comptes.set([...this.comptes(), newCompte]);
    }
    this.closeModal();
  }

  confirmDelete(): void {
    const current = this.dialogState().selectedCompte;
    if (!current?.id) return;
    this.comptes.set(this.comptes().filter(c => c.id !== current.id));
    this.closeModal();
  }

  roleBadgeText(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrateur',
      CONDUCTEUR: 'Conducteur',
      USAGER: 'Usager',
    };
    return map[role] || role;
  }
}
