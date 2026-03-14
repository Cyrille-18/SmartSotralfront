import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
  timeout: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  success(text: string, timeout: number = 3500): void {
    this.add('success', text, timeout);
  }

  error(text: string, timeout: number = 4500): void {
    this.add('error', text, timeout);
  }

  info(text: string, timeout: number = 3500): void {
    this.add('info', text, timeout);
  }

  warning(text: string, timeout: number = 4000): void {
    this.add('warning', text, timeout);
  }

  private add(type: ToastMessage['type'], text: string, timeout: number): void {
    const id = ++this.counter;
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, { id, type, text, timeout }]);

    setTimeout(() => this.dismiss(id), timeout);
  }

  dismiss(id: number): void {
    const filtered = this.messagesSubject.value.filter(m => m.id !== id);
    this.messagesSubject.next(filtered);
  }
}
