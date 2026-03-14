export interface PositionBus {
  vehiculeTrackingId: string;
  busTrackingId: string;
  busCode: string;
  ligneCode?: string;      // ex: L13
  ligneNumero?: string;    // alias/fallback
  latitude: number;
  longitude: number;
  vitesse: number;
  horodatage: string;
  missionActive: boolean;
}
