import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Bus } from '../../shared/models/bus.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BusService extends BaseService<Bus> {
  constructor(http: HttpClient) {
    super(http);
    this.setEndpoint('bus');
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bus/stats`);
  }

  changeStatus(id: number, statut: string): Observable<Bus> {
    return this.http.patch<Bus>(`${this.apiUrl}/bus/${id}/statut`, { statut });
  }
}
