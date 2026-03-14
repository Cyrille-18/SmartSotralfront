import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Prediction } from '../../shared/models/prediction.model';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  constructor() {}

  getPredictionParArret(arretTrackingId: string): Observable<Prediction[]> {
    return of([]);
  }
}
