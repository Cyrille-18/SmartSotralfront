export interface Ligne {
  id?: number;
  trackingId?: string;
  numero?: string;
  depart?: string;
  arrive?: string;
  typeLigneTrackingId?: string;

  // Champs legacy facultatifs (UI existante)
  nom?: string;
  description?: string;
  arrets?: number;
  nombreArrets?: number;
  createdAt?: string;
  updatedAt?: string;
}
