import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PositionBus } from '../../shared/models/position-bus.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PositionGPSService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dernières positions par bus actif (DTO PositionBusDTO)
  getDernierePositions(): Observable<PositionBus[]> {
    return this.http.get<PositionBus[]>(`${this.apiUrl}/capteurs/dernieres`);
  }

  getDernieresParLigne(ligneTrackingId: string): Observable<PositionBus[]> {
    return this.http.get<PositionBus[]>(`${this.apiUrl}/capteurs/dernieres/ligne/${ligneTrackingId}`);
  }

  getDernieresParArret(arretTrackingId: string): Observable<PositionBus[]> {
    return this.http.get<PositionBus[]>(`${this.apiUrl}/capteurs/dernieres/arret/${arretTrackingId}`);
  }

  getDernieres5ParVehicule(vehiculeTrackingId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/capteurs/vehicule/${vehiculeTrackingId}/dernieres5`);
  }
}
