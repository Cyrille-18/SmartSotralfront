export interface PositionBus {
  vehiculeTrackingId: string;
  busTrackingId: string;
  busCode: string;
  latitude: number;
  longitude: number;
  vitesse: number;
  horodatage: string;
  missionActive: boolean;
}
