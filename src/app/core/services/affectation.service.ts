import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Affectation } from '../../shared/models/affectation.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AffectationService extends BaseService<Affectation> {
  constructor(http: HttpClient) {
    super(http);
    this.setEndpoint('affectations');
  }

  getActives(): Observable<Affectation[]> {
    return this.http.get<Affectation[]>(`${this.apiUrl}/affectations/actives`);
  }

  terminer(id: number): Observable<Affectation> {
    return this.http.patch<Affectation>(`${this.apiUrl}/affectations/${id}/terminer`, {});
  }
}
