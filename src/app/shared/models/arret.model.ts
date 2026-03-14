export interface Arret {
  id?: number;
  trackingId?: string;
  nom: string;
  latitude: number;
  longitude: number;
  nombreLignes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LigneArret {
  id?: number;
  ligneTrackingId: string;
  arretTrackingId: string;
  ordre: number;
  tempsArriveeEstime?: number;
  createdAt?: string;
  updatedAt?: string;
}
