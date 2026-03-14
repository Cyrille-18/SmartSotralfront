export interface Prediction {
  id?: number;
  trackingId?: string;
  busTrackingId: string;
  arretTrackingId: string;
  distanceRestanteKm: number;
  tempsRestantMinutes: number;
  heureEstimeeArrivee: string; // ISO datetime
  horodatage: string;          // ISO datetime
}
