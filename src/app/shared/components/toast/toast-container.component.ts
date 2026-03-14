import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" *ngIf="messages.length > 0">
      <div
        class="toast"
        *ngFor="let msg of messages"
        [ngClass]="msg.type">
        <span>{{ msg.text }}</span>
        <button (click)="close(msg.id)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1200;
    }

    .toast {
      min-width: 260px;
      max-width: 360px;
      padding: 12px 14px;
      border-radius: 6px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      font-weight: 600;
    }

    .toast button {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 16px;
    }

    .toast.success { background: #2e7d32; }
    .toast.error { background: #c0392b; }
    .toast.info { background: #1565c0; }
    .toast.warning { background: #f39c12; color: #212121; }
  `],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  messages: ToastMessage[] = [];
  private sub?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.messages$.subscribe(msgs => (this.messages = msgs));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(id: number): void {
    this.toastService.dismiss(id);
  }
}
