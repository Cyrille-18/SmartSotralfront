import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PositionBus } from '../../shared/models/position-bus.model';

@Injectable({
  providedIn: 'root',
})
export class PositionGPSService {
  constructor() {}

  // Dernières positions par bus actif (DTO PositionBusDTO)
  getDernierePositions(): Observable<PositionBus[]> {
    const mock: PositionBus[] = [
      { vehiculeTrackingId: 'veh1', busTrackingId: 'bus1', busCode: 'B-101', latitude: 6.14, longitude: 1.21, vitesse: 32, horodatage: new Date().toISOString(), missionActive: true },
      { vehiculeTrackingId: 'veh2', busTrackingId: 'bus2', busCode: 'B-205', latitude: 6.13, longitude: 1.23, vitesse: 25, horodatage: new Date().toISOString(), missionActive: true },
    ];
    return of(mock);
  }

  getDernieresParLigne(ligneTrackingId: string): Observable<PositionBus[]> {
    return this.getDernierePositions();
  }

  getDernieresParArret(arretTrackingId: string): Observable<PositionBus[]> {
    return this.getDernierePositions();
  }

  getDernieres5ParVehicule(vehiculeTrackingId: string): Observable<any[]> {
    return of([]);
  }
}
