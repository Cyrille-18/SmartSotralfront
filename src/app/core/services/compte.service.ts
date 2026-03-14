import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Compte } from '../../shared/models/compte.model';
import { Observable } from 'rxjs';  

@Injectable({
  providedIn: 'root',
})
export class CompteService extends BaseService<Compte> {
  constructor(http: HttpClient) {
    super(http);
    this.setEndpoint('comptes');
  }

  changeStatut(trackingId: string, statut: string): Observable<Compte> {
    return this.http.patch<Compte>(`${this.apiUrl}/comptes/${trackingId}/statut`, { statut });
  }
}
