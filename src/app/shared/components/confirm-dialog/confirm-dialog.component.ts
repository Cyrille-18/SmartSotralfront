import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="cancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Confirmation</h2>
          <button class="close-btn" (click)="cancel()">✕</button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cancel()">Annuler</button>
          <button class="btn-danger" (click)="confirm()">Supprimer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: var(--sotral-blanc);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 90%;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--sotral-gris-b);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--sotral-vert);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--sotral-noir);
    }

    .modal-body {
      padding: 20px;
      color: var(--sotral-noir);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid var(--sotral-gris-b);
    }

    .btn-secondary,
    .btn-danger {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary {
      background-color: var(--sotral-gris-b);
      color: var(--sotral-noir);
    }

    .btn-secondary:hover {
      background-color: #d0d0d0;
    }

    .btn-danger {
      background-color: var(--sotral-rouge);
      color: var(--sotral-blanc);
    }

    .btn-danger:hover {
      background-color: #a02f20;
    }
  `],
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() message: string = 'Êtes-vous sûr ?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
