export type SourceSignal = 'GPS_CAPTEUR' | 'GPS_SIMULE';

export interface PositionGPS {
  id?: number;
  busId: number;
  latitude: number;
  longitude: number;
  vitesse: number;
  cap: number;
  horodatage: string;
  sourceSignal: SourceSignal;
}
