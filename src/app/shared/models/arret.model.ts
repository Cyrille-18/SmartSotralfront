export interface Arret {
  id?: number;
  trackingId?: string;
  nom: string;
  latitude: number;
  longitude: number;
}

export interface LigneArret {
  id?: number;
  ligneTrackingId: string;
  arretTrackingId: string;
  ordre: number;
}
