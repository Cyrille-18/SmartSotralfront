import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th *ngFor="let col of columns">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngIf="rowTemplate; else simpleRows">
            <ng-container
              *ngFor="let row of data"
              [ngTemplateOutlet]="rowTemplate"
              [ngTemplateOutletContext]="{ $implicit: row }">
            </ng-container>
          </ng-container>
          <ng-template #simpleRows>
            <tr *ngFor="let row of data">
              <td *ngFor="let col of columns">
                {{ row[col.key] }}
              </td>
            </tr>
          </ng-template>
          <tr *ngIf="data.length === 0">
            <td [attr.colspan]="columns.length" class="text-center">
              Aucune donnée
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background-color: var(--sotral-blanc);
    }

    thead {
      background-color: var(--sotral-gris-l);
      border-bottom: 2px solid var(--sotral-gris-b);
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: var(--sotral-noir);
    }

    td {
      padding: 12px;
      border-bottom: 1px solid var(--sotral-gris-b);
    }

    tbody tr:nth-child(even) {
      background-color: var(--sotral-gris-l);
    }

    tbody tr:hover {
      background-color: #e8f5e9;
    }

    .text-center {
      text-align: center;
      color: var(--sotral-noir);
      padding: 24px !important;
    }
  `],
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: Array<{ label: string; key: string }> = [];
  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<any> | null;
}
