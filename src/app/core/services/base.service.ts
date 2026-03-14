import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Base REST helper tuned for our backend: resources are addressed by trackingId (UUID string)
@Injectable({ providedIn: 'root' })
export class BaseService<T> {
  protected apiUrl = environment.apiUrl;
  protected endpoint = '';

  constructor(protected http: HttpClient) {}

  protected setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${this.endpoint}`);
  }

  getByTrackingId(trackingId: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${this.endpoint}/${trackingId}`);
  }

  create(data: T): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${this.endpoint}`, data);
  }

  update(trackingId: string, data: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${this.endpoint}/${trackingId}`, data);
  }

  delete(trackingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.endpoint}/${trackingId}`);
  }
}
