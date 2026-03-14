import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prediction } from '../../shared/models/prediction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPredictionParArret(arretTrackingId: string): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.apiUrl}/predictions/arret/${arretTrackingId}`);
  }
}
