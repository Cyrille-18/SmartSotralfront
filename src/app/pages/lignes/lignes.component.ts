import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ligne } from '../../shared/models/ligne.model';
import { Arret, LigneArret } from '../../shared/models/arret.model';

interface SelectedLigne {
  ligne: Ligne;
  arrets: LigneArret[];
}

@Component({
  selector: 'app-lignes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-lignes">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Lignes et Arrêts</h1>
          <p class="page-subtitle">Gérer les lignes du réseau et leurs arrêts</p>
        </div>
      </div>

      <div class="lignes-container">
        <!-- Left Panel - Lignes -->
        <section class="panel panel-lignes">
          <div class="panel-header">
            <h2>Lignes du réseau</h2>
            <button class="btn btn-sm btn-primary" (click)="openAddLigneModal()">
              + Créer
            </button>
          </div>

          <div class="lignes-list">
            @for (ligne of lignesList(); track ligne.id) {
              <div
                (click)="selectLigne(ligne)"
                [class.active]="(selectedLigne() && selectedLigne()!.ligne.id === ligne.id!) || false"
                class="ligne-card">
                <div class="ligne-title">{{ ligne.nom }}</div>
                <div class="ligne-desc">{{ ligne.description }}</div>
                <div class="ligne-meta">{{ ligne.nombreArrets || 0 }} arrêts</div>
              </div>
            } @empty {
              <div class="empty-state">Aucune ligne</div>
            }
          </div>
        </section>

        <!-- Right Panel - Arrêts -->
        <section class="panel panel-arrets">
          @if (selectedLigne()) {
            <div class="panel-content">
              <div class="panel-header">
                <div>
                  <h2>Arrêts de {{ selectedLigne()!.ligne.nom }}</h2>
                  <p class="arrets-count">{{ selectedLigne()!.arrets.length }} arrêts</p>
                </div>
                <button class="btn btn-sm btn-primary" (click)="openAddArretToLigneModal()">
                  + Ajouter
                </button>
              </div>

              @if (selectedLigne()!.arrets.length > 0) {
                <div class="arrets-list">
                  @for (arret of selectedLigne()!.arrets; track arret.id; let i = $index) {
                    <div class="arret-item">
                      <div class="arret-number">{{ i + 1 }}</div>
                      <div class="arret-info">
                        <div class="arret-nom">{{ arret.ligneTrackingId }}</div>
                        <div class="arret-coords">Lat: {{ arret.arretTrackingId }}</div>
                      </div>
                      <div class="arret-actions">
                        @if (i > 0) {
                          <button class="action-btn" title="Monter">⬆️</button>
                        }
                        @if (i < selectedLigne()!.arrets.length - 1) {
                          <button class="action-btn" title="Descendre">⬇️</button>
                        }
                        <button class="action-btn delete" (click)="removeArretFromLigne(arret.id)" title="Enlever">✕</button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">Aucun arrêt sur cette ligne</div>
              }
            </div>
          } @else {
            <div class="empty-state-large">
              <p>Sélectionnez une ligne pour voir ses arrêts</p>
            </div>
          }
        </section>
      </div>

      <!-- Arrêts du réseau section -->
      <section class="panel panel-all-arrets">
        <div class="panel-header">
          <h2>Tous les arrêts du réseau</h2>
          <button class="btn btn-sm btn-primary" (click)="openAddArretModal()">
            + Ajouter un arrêt
          </button>
        </div>

        <input
          type="text"
          placeholder="Rechercher un arrêt..."
          [(ngModel)]="searchArretValue"
          class="search-input"
          style="margin-bottom: 16px;">

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Lignes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (arret of filteredArrets(); track arret.id) {
                <tr>
                  <td class="arret-name">{{ arret.nom }}</td>
                  <td class="coords">{{ arret.latitude }}</td>
                  <td class="coords">{{ arret.longitude }}</td>
                  <td class="ligne-count">{{ arret.nombreLignes || 0 }}</td>
                  <td class="action-cell">
                    <button class="action-link">✏️</button>
                    <button class="action-link delete">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr class="empty-row">
                  <td colspan="5" class="text-center">Aucun arrêt</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Add Ligne Modal -->
      @if (showAddLigneModal()) {
        <div class="modal-overlay" (click)="showAddLigneModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Créer une ligne</h2>
              <button class="btn-close" (click)="showAddLigneModal.set(false)">✕</button>
            </div>
            <form [formGroup]="ligneForm" (ngSubmit)="submitAddLigne()" class="modal-form">
              <div class="form-group">
                <label>Nom de la ligne</label>
                <input type="text" formControlName="nom" placeholder="Ligne 3" required>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea formControlName="description" placeholder="Lomé Centre → Bè Kpota" rows="2"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="showAddLigneModal.set(false)">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="!ligneForm.valid">Créer la ligne</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Add Arrêt Modal -->
      @if (showAddArretModal()) {
        <div class="modal-overlay" (click)="showAddArretModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Ajouter un arrêt</h2>
              <button class="btn-close" (click)="showAddArretModal.set(false)">✕</button>
            </div>
            <form [formGroup]="arretForm" (ngSubmit)="submitAddArret()" class="modal-form">
              <div class="form-group">
                <label>Nom de l'arrêt</label>
                <input type="text" formControlName="nom" placeholder="Marché de Bè" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Latitude</label>
                  <input type="number" formControlName="latitude" placeholder="6.1372" step="0.0001" required>
                </div>
                <div class="form-group">
                  <label>Longitude</label>
                  <input type="number" formControlName="longitude" placeholder="1.2228" step="0.0001" required>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="showAddArretModal.set(false)">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="!arretForm.valid">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-lignes { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .page-header { margin-bottom: var(--spacing-lg); }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 700; color: var(--sotral-vert); font-family: var(--font-primary); }
    .page-subtitle { margin: 4px 0 0 0; font-size: 14px; color: #999; }
    .lignes-container { display: grid; grid-template-columns: 350px 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-lg); }
    @media (max-width: 1024px) { .lignes-container { grid-template-columns: 1fr; } }
    
    .panel { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: var(--spacing-lg); }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); padding-bottom: var(--spacing-md); border-bottom: 1px solid #e0e0e0; }
    .panel-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: var(--sotral-vert); }

    .lignes-list { display: flex; flex-direction: column; gap: 8px; }
    .ligne-card { padding: 12px; border: 2px solid transparent; border-radius: var(--radius-md); background-color: var(--sotral-blanc-casse); cursor: pointer; transition: all 0.2s ease; }
    .ligne-card:hover { border-color: var(--sotral-vert); }
    .ligne-card.active { border-color: var(--sotral-vert); background-color: #E8F5E9; }
    .ligne-title { font-weight: 600; color: var(--sotral-vert); font-size: 14px; }
    .ligne-desc { font-size: 12px; color: #999; margin-top: 2px; }
    .ligne-meta { font-size: 11px; color: #ccc; margin-top: 4px; }

    .panel-content { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .arrets-count { font-size: 12px; color: #999; margin: 0; }
    .arrets-list { display: flex; flex-direction: column; gap: 8px; }
    .arret-item { display: flex; align-items: center; gap: 12px; padding: 10px; background-color: var(--sotral-blanc-casse); border-radius: var(--radius-md); border-left: 3px solid var(--sotral-vert); }
    .arret-number { min-width: 30px; width: 30px; height: 30px; border-radius: 50%; background-color: var(--sotral-vert); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
    .arret-info { flex: 1; }
    .arret-nom { font-weight: 600; font-size: 13px; color: #333; }
    .arret-coords { font-size: 11px; color: #999; margin-top: 2px; }
    .arret-actions { display: flex; gap: 4px; }
    .action-btn { padding: 4px 6px; background: none; border: none; cursor: pointer; font-size: 14px; border-radius: 4px; transition: all 0.2s; }
    .action-btn:hover { background-color: rgba(0, 0, 0, 0.1); }
    .action-btn.delete:hover { background-color: #F8D7DA; }

    .empty-state { text-align: center; color: #999; padding: var(--spacing-lg); background-color: var(--sotral-blanc-casse); border-radius: var(--radius-md); }
    .empty-state-large { text-align: center; color: #999; padding: 60px 20px; background-color: var(--sotral-blanc-casse); border-radius: var(--radius-md); font-size: 16px; }
    .panel-all-arrets { grid-column: 1 / -1; }

    .search-input { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: var(--radius-md); font-size: 14px; }
    .search-input:focus { outline: none; border-color: var(--sotral-vert); box-shadow: 0 0 0 3px rgba(27, 122, 62, 0.1); }

    .table-responsive { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table thead { background-color: var(--sotral-blanc-casse); }
    .table th { padding: 10px 12px; text-align: left; font-weight: 600; color: #666; border-bottom: 1px solid #e0e0e0; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; color: #333; }
    .arret-name { font-weight: 600; color: var(--sotral-vert); }
    .coords { font-family: monospace; font-size: 12px; color: #999; }
    .ligne-count { text-align: center; font-weight: 600; }
    .action-cell { display: flex; gap: 8px; }
    .action-link { background: none; border: none; cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
    .action-link:hover { background-color: var(--sotral-blanc-casse); }
    .action-link.delete:hover { background-color: #F8D7DA; }
    .empty-row { background-color: var(--sotral-blanc-casse); }
    .text-center { text-align: center; color: #999; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); max-width: 450px; width: 90%; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-lg); border-bottom: 1px solid #e0e0e0; }
    .modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: var(--sotral-vert); font-family: var(--font-primary); }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; padding: 4px; }
    .btn-close:hover { color: #333; }

    .modal-form { padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-weight: 600; font-size: 14px; color: #333; }
    .form-group input, .form-group textarea, .form-group select { padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: var(--radius-md); font-size: 14px; font-family: var(--font-secondary); }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--sotral-vert); box-shadow: 0 0 0 3px rgba(27, 122, 62, 0.1); }
    .form-group textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }
    .form-actions { display: flex; gap: var(--spacing-md); justify-content: flex-end; padding-top: var(--spacing-md); border-top: 1px solid #e0e0e0; }

    .btn { padding: 10px 16px; border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s ease; font-family: var(--font-secondary); }
    .btn.btn-primary { background-color: var(--sotral-vert); color: white; }
    .btn.btn-primary:hover:not(:disabled) { background-color: #158430; box-shadow: var(--shadow-md); }
    .btn.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.btn-secondary { background-color: transparent; border: 2px solid var(--sotral-vert); color: var(--sotral-vert); }
    .btn.btn-secondary:hover { background-color: var(--sotral-blanc-casse); }
    .btn.btn-sm { padding: 6px 12px; font-size: 12px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LignesComponent implements OnInit {
  private fb = inject(FormBuilder);

  lignesList = signal<Ligne[]>([
    { id: 1, nom: 'Ligne 1', description: 'Lomé Centre → Port', nombreArrets: 8 },
    { id: 2, nom: 'Ligne 3', description: 'Lomé Centre → Bè Kpota', nombreArrets: 12 },
    { id: 3, nom: 'Ligne 8', description: 'Adidogomé → Togblékopé', nombreArrets: 15 },
  ]);

  arretsList = signal<Arret[]>([
    { id: 1, nom: 'Gare routière', latitude: 6.1372, longitude: 1.2228, nombreLignes: 3 },
    { id: 2, nom: 'Marché de Bè', latitude: 6.1375, longitude: 1.2123, nombreLignes: 2 },
    { id: 3, nom: 'Grand Marché', latitude: 6.1250, longitude: 1.2300, nombreLignes: 4 },
  ]);

  ligneArrets = signal<LigneArret[]>([
    { id: 1, ligneTrackingId: '1', arretTrackingId: '1', ordre: 1 },
    { id: 2, ligneTrackingId: '1', arretTrackingId: '2', ordre: 2 },
  ]);

  selectedLigne = signal<SelectedLigne | null>(null);
  searchArretValue = '';
  showAddLigneModal = signal(false);
  showAddArretModal = signal(false);

  ligneForm: FormGroup;
  arretForm: FormGroup;

  filteredArrets = computed(() => {
    const search = this.searchArretValue.toLowerCase();
    return this.arretsList().filter(a => a.nom.toLowerCase().includes(search));
  });

  constructor() {
    this.ligneForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
    });
    this.arretForm = this.fb.group({
      nom: ['', Validators.required],
      latitude: [0, Validators.required],
      longitude: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.lignesList().length > 0) {
      this.selectLigne(this.lignesList()[0]);
    }
  }

  selectLigne(ligne: Ligne): void {
    const arrets = this.ligneArrets().filter(la => la.ligneTrackingId === ligne.trackingId || la.ligneTrackingId === ligne.id?.toString());
    this.selectedLigne.set({ ligne, arrets });
  }

  openAddLigneModal(): void {
    this.ligneForm.reset();
    this.showAddLigneModal.set(true);
  }

  submitAddLigne(): void {
    if (!this.ligneForm.valid) return;
    const newLigne: Ligne = {
      id: Math.max(...this.lignesList().map(l => l.id || 0), 0) + 1,
      ...this.ligneForm.value,
      nombreArrets: 0,
    };
    this.lignesList.set([...this.lignesList(), newLigne]);
    this.showAddLigneModal.set(false);
  }

  openAddArretModal(): void {
    this.arretForm.reset();
    this.showAddArretModal.set(true);
  }

  submitAddArret(): void {
    if (!this.arretForm.valid) return;
    const newArret: Arret = {
      id: Math.max(...this.arretsList().map(a => a.id || 0), 0) + 1,
      ...this.arretForm.value,
      nombreLignes: 0,
    };
    this.arretsList.set([...this.arretsList(), newArret]);
    this.showAddArretModal.set(false);
  }

  openAddArretToLigneModal(): void {}

  removeArretFromLigne(arretId: number | undefined): void {
    if (!this.selectedLigne()) return;
    const updated = this.ligneArrets().filter(la => la.id !== arretId);
    this.ligneArrets.set(updated);
    this.selectLigne(this.selectedLigne()!.ligne);
  }
}
