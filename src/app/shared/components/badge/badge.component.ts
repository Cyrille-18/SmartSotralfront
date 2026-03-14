import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [ngClass]="['badge', badgeClass]">{{ value }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-success {
      background-color: #d4edda;
      color: #155724;
    }

    .badge-danger {
      background-color: #f8d7da;
      color: #721c24;
    }

    .badge-warning {
      background-color: #fff3cd;
      color: #856404;
    }

    .badge-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .badge-secondary {
      background-color: var(--sotral-gris-b);
      color: var(--sotral-noir);
    }

    .badge-primary {
      background-color: var(--sotral-vert);
      color: var(--sotral-blanc);
    }
  `],
})
export class BadgeComponent {
  @Input() value: string = '';
  @Input() type: 'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'primary' = 'secondary';

  get badgeClass(): string {
    return `badge-${this.type}`;
  }
}
