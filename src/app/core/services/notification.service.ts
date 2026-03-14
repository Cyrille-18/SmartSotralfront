import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../shared/models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications?page=${page}&size=${size}`);
  }

  getRecent(limit: number = 10): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/recent?limit=${limit}`);
  }

  getByStatut(statut: string, page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications?statut=${statut}&page=${page}&size=${size}`);
  }

  reessayer(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/notifications/${id}/reessayer`, {});
  }
}
